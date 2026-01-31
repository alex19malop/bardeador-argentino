"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { Twitter, MessageCircle, Volume2, VolumeX, Flame, Zap, Star, Copy, Check, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { generateInsult } from "@/lib/markov";

const MEME_PHRASES = [
  "DALE BO",
  "VAMOS CARAJO",
  "QUE MIRAS BOBO",
  "ANDA PA ALLA",
  "AGUANTE TODO",
  "LA CONCHA DE TU MADRE",
  "DALE DALE DALE",
];

const LOADING_PHRASES = [
  "Consultando al Diego...",
  "Pidiendo permiso al Messi...",
  "Cargando bronca...",
  "Importando puteadas de la cancha...",
  "Canalizando la energía del Diego...",
  "Invocando al espíritu bardeador...",
  "Descargando insultos del más allá...",
  "Mezclando puteadas con mate...",
  "Consultando el VAR del bardo...",
  "Activando modo argentino...",
];

// Traducciones gallego (español de España pero mal)
const GALLEGO_TRANSLATIONS: Record<string, string> = {
  "bardear": "insultar tío",
  "bardo": "follón",
  "bardos": "follones",
  "che": "tío",
  "boludo": "gilipollas",
  "pelotudo": "imbécil",
  "la concha": "hostia puta",
  "concha": "coño",
  "puta": "zorra",
  "forro": "capullo",
  "gordo": "gordo de mierda",
  "pija": "polla",
  "orto": "culo",
  "chabón": "chaval",
  "guita": "pasta",
  "mina": "tía",
  "pibe": "chaval",
  "laburo": "curro",
  "afanar": "mangar",
  "morfar": "jamar",
  "garpar": "soltar la pasta",
  "trucho": "falso",
  "chorro": "chorizo",
  "mango": "pavo",
  "guacho": "hijoputa",
  "cagada": "cagada",
  "quilombo": "follón",
  "bondi": "bus",
  "birra": "cerveza",
  "puteadas": "insultos",
  "puteada": "insulto",
};

function translateToGallego(text: string): string {
  let result = text.toLowerCase();
  for (const [arg, esp] of Object.entries(GALLEGO_TRANSLATIONS)) {
    result = result.replace(new RegExp(arg, 'gi'), esp.trim());
  }
  // Agregar muletillas españolas random
  const muletillas = [" tío", " joder", " hostia", " macho", " colega"];
  if (Math.random() > 0.5) {
    result += muletillas[Math.floor(Math.random() * muletillas.length)];
  }
  return result;
}

const SUN_OF_MAY = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <defs>
      <radialGradient id="sunGradient" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#FFE066" />
        <stop offset="100%" stopColor="#F6B40E" />
      </radialGradient>
    </defs>
    {/* Sun rays */}
    {[...Array(32)].map((_, i) => (
      <line
        key={i}
        x1="50"
        y1="50"
        x2={50 + 45 * Math.cos((i * 11.25 * Math.PI) / 180)}
        y2={50 + 45 * Math.sin((i * 11.25 * Math.PI) / 180)}
        stroke="#F6B40E"
        strokeWidth={i % 2 === 0 ? "3" : "1.5"}
        opacity="0.8"
      />
    ))}
    {/* Sun face */}
    <circle cx="50" cy="50" r="20" fill="url(#sunGradient)" />
    {/* Eyes */}
    <circle cx="44" cy="47" r="2" fill="#1a365d" />
    <circle cx="56" cy="47" r="2" fill="#1a365d" />
    {/* Mouth - smirk */}
    <path
      d="M 42 55 Q 50 62, 58 55"
      fill="none"
      stroke="#1a365d"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export default function Home() {
  const [startWord, setStartWord] = useState("");
  const [generatedInsult, setGeneratedInsult] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [shakeScreen, setShakeScreen] = useState(false);
  const [memePhrase, setMemePhrase] = useState("");
  const [copied, setCopied] = useState(false);
  const [generateCount, setGenerateCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [loadingPhrase, setLoadingPhrase] = useState("");
  const [furiaMode, setFuriaMode] = useState(false);
  const [gallegoMode, setGallegoMode] = useState(false);
  const [easterEggTriggered, setEasterEggTriggered] = useState<"messi" | "diego" | null>(null);
  const [epicZoom, setEpicZoom] = useState<"maradona" | "messi" | null>(null);
  const lastShakeTime = useRef(0);

  useEffect(() => {
    setMemePhrase(MEME_PHRASES[Math.floor(Math.random() * MEME_PHRASES.length)]);
  }, []);

  // Activar modo furia después de 5 bardos
  useEffect(() => {
    if (generateCount >= 5 && !furiaMode) {
      setFuriaMode(true);
    }
  }, [generateCount, furiaMode]);

  // Shake detection para móvil
  useEffect(() => {
    let lastX = 0, lastY = 0, lastZ = 0;
    const threshold = 25;

    const handleMotion = (event: DeviceMotionEvent) => {
      const acceleration = event.accelerationIncludingGravity;
      if (!acceleration || acceleration.x === null || acceleration.y === null || acceleration.z === null) return;

      const deltaX = Math.abs(acceleration.x - lastX);
      const deltaY = Math.abs(acceleration.y - lastY);
      const deltaZ = Math.abs(acceleration.z - lastZ);

      if ((deltaX > threshold || deltaY > threshold || deltaZ > threshold)) {
        const now = Date.now();
        if (now - lastShakeTime.current > 2000) { // Cooldown de 2 segundos
          lastShakeTime.current = now;
          handleGenerate();
        }
      }

      lastX = acceleration.x;
      lastY = acceleration.y;
      lastZ = acceleration.z;
    };

    // Pedir permiso en iOS
    if (typeof DeviceMotionEvent !== 'undefined' && typeof (DeviceMotionEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission === 'function') {
      (DeviceMotionEvent as unknown as { requestPermission: () => Promise<string> }).requestPermission()
        .then((response: string) => {
          if (response === 'granted') {
            window.addEventListener('devicemotion', handleMotion);
          }
        })
        .catch(console.error);
    } else {
      window.addEventListener('devicemotion', handleMotion);
    }

    return () => {
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, []);

  const playSound = useCallback((type: "generate" | "result" | "easterEgg") => {
    if (!soundEnabled) return;
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    if (type === "generate") {
      oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } else if (type === "easterEgg") {
      // Sonido épico para easter egg
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
      oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.2);
      oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.3);
      oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.4);
      gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } else {
      oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.05);
      oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.1);
      oscillator.frequency.exponentialRampToValueAtTime(1000, audioContext.currentTime + 0.15);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    }
  }, [soundEnabled]);

  const handleGenerate = useCallback(() => {
    setIsGenerating(true);
    setShowResult(false);
    setShakeScreen(true);
    setEasterEggTriggered(null);
    setEpicZoom(null);
    setLoadingPhrase(LOADING_PHRASES[Math.floor(Math.random() * LOADING_PHRASES.length)]);
    playSound("generate");
    
    // Check for easter eggs
    const lowerStart = startWord.trim().toLowerCase();
    const isMessiEgg = lowerStart === "messi" || lowerStart === "lionel";
    const isDiegoEgg = lowerStart === "diego" || lowerStart === "maradona";
    
    // Dramatic delay (más largo en modo furia)
    const shakeTime = furiaMode ? 1200 : 800;
    setTimeout(() => {
      setShakeScreen(false);
    }, shakeTime);

    const generateTime = furiaMode ? 1800 : 1200;
    setTimeout(() => {
      let insult = generateInsult(startWord.trim() || undefined);
      
      // Easter eggs
      if (isMessiEgg) {
        insult = "¿QUÉ MIRÁS, BOBO? ANDÁ PA' ALLÁ, BOBO. " + insult;
        setEasterEggTriggered("messi");
        setEpicZoom("messi");
        playSound("easterEgg");
      } else if (isDiegoEgg) {
        insult = "LA PELOTA NO SE MANCHA... PERO VOS SÍ, HIJO DE PUTA. " + insult;
        setEasterEggTriggered("diego");
        setEpicZoom("maradona");
        playSound("easterEgg");
      } else {
        // Zoom épico aleatorio
        if (Math.random() > 0.5) {
          setEpicZoom(Math.random() > 0.5 ? "maradona" : "messi");
        }
      }
      
      // Traducir si está en modo gallego
      if (gallegoMode) {
        insult = translateToGallego(insult);
      }
      
      setGeneratedInsult(insult);
      setShowResult(true);
      setIsGenerating(false);
      setGenerateCount(prev => prev + 1);
      setMemePhrase(MEME_PHRASES[Math.floor(Math.random() * MEME_PHRASES.length)]);
      
      if (!isMessiEgg && !isDiegoEgg) {
        playSound("result");
      }
      
      // Reset epic zoom después de un tiempo
      setTimeout(() => setEpicZoom(null), 2000);
    }, generateTime);
  }, [startWord, playSound, furiaMode, gallegoMode]);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(generatedInsult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnTwitter = () => {
    if (!generatedInsult) return;
    const text = encodeURIComponent(`"${generatedInsult}" \n\n- El Bardeador Argentino`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
  };

  const shareOnWhatsApp = () => {
    if (!generatedInsult) return;
    const text = encodeURIComponent(`"${generatedInsult}" - El Bardeador Argentino`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  return (
    <main className={`min-h-screen relative overflow-hidden ${shakeScreen ? (furiaMode ? "mega-shake" : "intense-shake") : ""} ${furiaMode ? "furia-mode" : ""}`}>
      {/* Crazy background */}
      <div className={`absolute inset-0 transition-all duration-500 ${furiaMode ? "bg-linear-to-b from-red-600 via-red-400 via-50% to-red-600" : "bg-linear-to-b from-[#75AADB] via-white via-50% to-[#75AADB]"}`} />
      
      {/* Floating suns */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-10 -left-10 w-40 h-40 opacity-20 spin-slow">
          <SUN_OF_MAY />
        </div>
        <div className="absolute top-1/4 -right-20 w-60 h-60 opacity-15 spin-slow" style={{ animationDirection: "reverse" }}>
          <SUN_OF_MAY />
        </div>
        <div className="absolute -bottom-20 left-1/4 w-48 h-48 opacity-20 spin-slow">
          <SUN_OF_MAY />
        </div>
        <div className="absolute bottom-1/4 right-10 w-32 h-32 opacity-25 spin-slow" style={{ animationDirection: "reverse", animationDuration: "12s" }}>
          <SUN_OF_MAY />
        </div>
      </div>

      {/* Sound toggle */}
      <button
        onClick={() => setSoundEnabled(!soundEnabled)}
        className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/80 hover:bg-white shadow-lg transition-all hover:scale-110"
        aria-label={soundEnabled ? "Mutear sonidos" : "Activar sonidos"}
      >
        {soundEnabled ? (
          <Volume2 className="w-5 h-5 text-[#1a365d]" />
        ) : (
          <VolumeX className="w-5 h-5 text-[#1a365d]" />
        )}
      </button>

      {/* Counter badge */}
      {generateCount > 0 && (
        <div className={`absolute top-4 left-4 z-50 px-3 py-1 rounded-full font-bold text-sm shadow-lg bounce-in ${furiaMode ? "bg-black text-red-500 animate-pulse" : "bg-[#F6B40E] text-[#1a365d]"}`}>
          {furiaMode ? "🔥 MODO FURIA 🔥" : `${generateCount} ${generateCount === 1 ? "bardo" : "bardos"} generados`}
        </div>
      )}

      {/* Modo Gallego toggle */}
      <button
        onClick={() => setGallegoMode(!gallegoMode)}
        className={`absolute top-16 right-4 z-50 p-2 rounded-full shadow-lg transition-all hover:scale-110 ${gallegoMode ? "bg-red-600 text-yellow-400" : "bg-white/80 hover:bg-white"}`}
        aria-label={gallegoMode ? "Desactivar modo gallego" : "Activar modo gallego"}
        title={gallegoMode ? "Modo Gallego ON" : "Modo Gallego (traduce a español de España)"}
      >
        <Flag className={`w-5 h-5 ${gallegoMode ? "text-yellow-400" : "text-[#1a365d]"}`} />
      </button>
      {gallegoMode && (
        <div className="absolute top-[104px] right-4 z-50 px-2 py-1 bg-red-600 text-yellow-400 text-xs font-bold rounded shadow-lg">
          🇪🇸 MODO GALLEGO
        </div>
      )}

      <div className="relative z-10 container mx-auto px-4 py-6 min-h-screen flex flex-col">
        {/* Header with patrons */}
        <header className="flex items-center justify-center gap-4 md:gap-8 mb-6">
          {/* Maradona */}
          <div className="flex flex-col items-center patron-frame cursor-pointer" title="D10S">
            <div className={`relative w-20 h-20 md:w-28 md:h-28 rounded-full overflow-hidden border-4 border-[#F6B40E] shadow-xl float transition-all duration-500 ${epicZoom === "maradona" ? "epic-zoom" : ""} ${easterEggTriggered === "diego" ? "ring-4 ring-yellow-400 ring-opacity-75 animate-pulse" : ""}`} style={{ animationDelay: "0s" }}>
              <Image
                src="/maradona.jpg"
                alt="Diego Maradona - D10S"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-[#F6B40E]/30 to-transparent" />
            </div>
            <span className="mt-2 text-xs md:text-sm font-black text-[#1a365d] uppercase tracking-wider drop-shadow-sm">
              {easterEggTriggered === "diego" ? "🔥 D10S 🔥" : "D10S"}
            </span>
          </div>

          {/* Title */}
          <div className="text-center">
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-[#1a365d] tracking-tight leading-none">
              <span className="block text-stroke md:glow-text">EL BARDEADOR</span>
              <span className="block text-[#F6B40E] text-stroke-gold md:fire-text mt-1">ARGENTINO</span>
            </h1>
            <p className="mt-2 text-xs md:text-sm text-[#4a6fa5] font-bold uppercase tracking-widest">
              Generador de puteadas nivel dios
            </p>
          </div>

          {/* Messi */}
          <div className="flex flex-col items-center patron-frame cursor-pointer" title="EL GOAT">
            <div className={`relative w-20 h-20 md:w-28 md:h-28 rounded-full overflow-hidden border-4 border-[#F6B40E] shadow-xl float transition-all duration-500 ${epicZoom === "messi" ? "epic-zoom" : ""} ${easterEggTriggered === "messi" ? "ring-4 ring-yellow-400 ring-opacity-75 animate-pulse" : ""}`} style={{ animationDelay: "1.5s" }}>
              <Image
                src="/messi.jpg"
                alt="Lionel Messi - El GOAT"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-[#F6B40E]/30 to-transparent" />
            </div>
            <span className="mt-2 text-xs md:text-sm font-black text-[#1a365d] uppercase tracking-wider drop-shadow-sm">
              {easterEggTriggered === "messi" ? "🐐 GOAT 🐐" : "EL GOAT"}
            </span>
          </div>
        </header>

        {/* Main content */}
        <div className="flex-1 flex flex-col items-center justify-center max-w-xl mx-auto w-full gap-6">
          {/* Input */}
          <div className="w-full">
            <label htmlFor="startWord" className="block text-sm font-black text-[#1a365d] mb-2 uppercase">
              Con que palabra arrancamos, che?
            </label>
            <Input
              id="startWord"
              type="text"
              placeholder="Ej: Sos, Anda, Que..."
              value={startWord}
              onChange={(e) => setStartWord(e.target.value)}
              className="w-full h-14 text-lg bg-white border-4 border-[#75AADB] focus:border-[#F6B40E] focus:ring-[#F6B40E] text-[#1a365d] placeholder:text-[#a0b8d0] font-bold rounded-xl shadow-lg"
              onKeyDown={(e) => e.key === "Enter" && !isGenerating && handleGenerate()}
            />
            <p className="mt-1 text-xs text-[#4a6fa5] font-medium">
              (Opcional) Dejalo vacio y te tiramos una sorpresa
            </p>
          </div>

          {/* MEGA GENERATE BUTTON */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`mega-button w-full py-8 text-2xl md:text-3xl font-black border-4 rounded-2xl shadow-2xl uppercase tracking-wider disabled:opacity-50 transition-all ${furiaMode ? "bg-black hover:bg-gray-900 text-red-500 border-red-600 animate-pulse" : "bg-[#F6B40E] hover:bg-[#d99e0a] text-[#1a365d] border-[#1a365d]"}`}
          >
            {isGenerating ? (
              <span className="flex items-center gap-3">
                <Zap className="w-8 h-8 animate-pulse" />
                {gallegoMode ? "PROCESANDO FOLLÓN..." : "PROCESANDO BARDO..."}
              </span>
            ) : (
              <span className="flex items-center gap-3">
                <Flame className="w-8 h-8" />
                {gallegoMode ? "¡INSULTAR TÍO!" : (furiaMode ? "🔥 BARDEAR 🔥" : "BARDEAR!")}
                <Flame className="w-8 h-8" />
              </span>
            )}
          </Button>

          {/* Result */}
          {showResult && generatedInsult && (
            <div className="w-full slide-up-bounce">
              <div className={`relative bg-white border-4 rounded-2xl shadow-2xl overflow-hidden ${furiaMode ? "border-red-600" : "border-[#1a365d]"} ${easterEggTriggered ? "ring-4 ring-yellow-400" : ""}`}>
                {/* Decorative top bar */}
                <div className={`h-2 ${furiaMode ? "bg-linear-to-r from-red-600 via-orange-500 to-red-600" : "rainbow-border"}`} />
                
                <div className="p-6">
                  {/* Easter egg banner */}
                  {easterEggTriggered && (
                    <div className="mb-4 p-2 bg-yellow-400 text-black text-center font-black text-sm rounded-lg animate-pulse">
                      {easterEggTriggered === "messi" ? "🐐 EASTER EGG: QUÉ MIRÁS BOBO ACTIVATED 🐐" : "⚽ EASTER EGG: D10S MODE ACTIVATED ⚽"}
                    </div>
                  )}
                  
                  {/* Meme phrase */}
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Star className={`w-5 h-5 ${furiaMode ? "text-red-500 fill-red-500" : "text-[#F6B40E] fill-[#F6B40E]"}`} />
                    <span className={`text-xs font-black uppercase tracking-widest ${furiaMode ? "text-red-500" : "text-[#F6B40E]"}`}>
                      {gallegoMode ? "HOSTIA TÍO" : memePhrase}
                    </span>
                    <Star className={`w-5 h-5 ${furiaMode ? "text-red-500 fill-red-500" : "text-[#F6B40E] fill-[#F6B40E]"}`} />
                  </div>

                  {/* The insult */}
                  <blockquote className={`text-xl md:text-2xl lg:text-3xl font-black text-center leading-tight text-reveal ${furiaMode ? "text-red-600" : "text-[#1a365d]"}`}>
                    {'"'}{generatedInsult}{'"'}
                  </blockquote>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3 mt-6 justify-center">
                    <Button
                      onClick={copyToClipboard}
                      variant="outline"
                      className="border-2 border-[#1a365d] text-[#1a365d] hover:bg-[#1a365d] hover:text-white font-bold bg-transparent"
                    >
                      {copied ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="mr-2 h-4 w-4" />
                          Copiar
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={shareOnTwitter}
                      variant="outline"
                      className="border-2 border-[#1a365d] text-[#1a365d] hover:bg-[#1a365d] hover:text-white font-bold bg-transparent"
                    >
                      <Twitter className="mr-2 h-4 w-4" />
                      X
                    </Button>
                    <Button
                      onClick={shareOnWhatsApp}
                      variant="outline"
                      className="border-2 border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white font-bold bg-transparent"
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      WhatsApp
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!showResult && !isGenerating && (
            <div className="w-full p-8 bg-white/60 border-4 border-dashed border-[#75AADB] rounded-2xl text-center">
              <div className="w-24 h-24 mx-auto mb-4 opacity-60">
                <SUN_OF_MAY />
              </div>
              <p className="text-[#4a6fa5] font-bold text-lg">
                Apreta el boton y te generamos un bardo al toque, papu
              </p>
            </div>
          )}

          {/* Loading state */}
          {isGenerating && (
            <div className={`w-full p-8 border-4 rounded-2xl text-center ${furiaMode ? "bg-black/80 border-red-600" : "bg-white/80 border-[#F6B40E]"}`}>
              <div className="w-24 h-24 mx-auto mb-4 spin-slow">
                <SUN_OF_MAY />
              </div>
              <p className={`font-black text-lg uppercase animate-pulse ${furiaMode ? "text-red-500" : "text-[#1a365d]"}`}>
                {loadingPhrase}
              </p>
              <p className="text-xs text-gray-500 mt-2 md:hidden">
                💡 Tip: Agitá el celular para bardear!
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-6 text-center">
          <p className="text-xs text-[#4a6fa5] font-bold">
            Hecho con bronca y mate en Argentina
          </p>
          <p className="text-[10px] text-[#36536e] mt-1">
            Powered by AI (y un toque de locura)
          </p>
        </footer>
      </div>

      <style jsx>{`
        .text-stroke {
          -webkit-text-stroke: 2px #1a365d;
          paint-order: stroke fill;
        }
        .text-stroke-gold {
          -webkit-text-stroke: 2px #d99e0a;
          paint-order: stroke fill;
        }
        .furia-mode {
          animation: furia-pulse 0.5s ease-in-out infinite;
        }
        @keyframes furia-pulse {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.1) saturate(1.2); }
        }
        .mega-shake {
          animation: mega-shake 0.15s ease-in-out infinite;
        }
        @keyframes mega-shake {
          0%, 100% { transform: translateX(0) rotate(0); }
          25% { transform: translateX(-8px) rotate(-2deg); }
          75% { transform: translateX(8px) rotate(2deg); }
        }
        .epic-zoom {
          animation: epic-zoom 0.5s ease-out forwards;
          z-index: 100;
        }
        @keyframes epic-zoom {
          0% { transform: scale(1); }
          50% { transform: scale(1.8); }
          100% { transform: scale(1.3); }
        }
      `}</style>
    </main>
  );
}
