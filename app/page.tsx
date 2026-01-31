"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { Twitter, MessageCircle, Volume2, VolumeX, Flame, Zap, Star, Copy, Check } from "lucide-react";
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

  useEffect(() => {
    setMemePhrase(MEME_PHRASES[Math.floor(Math.random() * MEME_PHRASES.length)]);
  }, []);

  const playSound = useCallback((type: "generate" | "result") => {
    if (!soundEnabled) return;
    // Create oscillator for retro sound effects
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
    playSound("generate");
    
    // Dramatic delay
    setTimeout(() => {
      setShakeScreen(false);
    }, 800);

    setTimeout(() => {
      const insult = generateInsult(startWord.trim() || undefined);
      setGeneratedInsult(insult);
      setShowResult(true);
      setIsGenerating(false);
      setGenerateCount(prev => prev + 1);
      setMemePhrase(MEME_PHRASES[Math.floor(Math.random() * MEME_PHRASES.length)]);
      playSound("result");
    }, 1200);
  }, [startWord, playSound]);

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
    <main className={`min-h-screen relative overflow-hidden ${shakeScreen ? "intense-shake" : ""}`}>
      {/* Crazy background */}
      <div className="absolute inset-0 bg-linear-to-b from-[#75AADB] via-white via-50% to-[#75AADB]" />
      
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
        <div className="absolute top-4 left-4 z-50 px-3 py-1 rounded-full bg-[#F6B40E] text-[#1a365d] font-bold text-sm shadow-lg bounce-in">
          {generateCount} {generateCount === 1 ? "bardo" : "bardos"} generados
        </div>
      )}

      <div className="relative z-10 container mx-auto px-4 py-6 min-h-screen flex flex-col">
        {/* Header with patrons */}
        <header className="flex items-center justify-center gap-4 md:gap-8 mb-6">
          {/* Maradona */}
          <div className="flex flex-col items-center patron-frame cursor-pointer" title="D10S">
            <div className="relative w-20 h-20 md:w-28 md:h-28 rounded-full overflow-hidden border-4 border-[#F6B40E] shadow-xl float" style={{ animationDelay: "0s" }}>
              <Image
                src="/maradona.jpg"
                alt="Diego Maradona - D10S"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-[#F6B40E]/30 to-transparent" />
            </div>
            <span className="mt-2 text-xs md:text-sm font-black text-[#1a365d] uppercase tracking-wider drop-shadow-sm">
              D10S
            </span>
          </div>

          {/* Title */}
          <div className="text-center">
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-[#1a365d] tracking-tight leading-none">
              <span className="block text-stroke glow-text">EL BARDEADOR</span>
              <span className="block text-[#F6B40E] text-stroke-gold fire-text mt-1">ARGENTINO</span>
            </h1>
            <p className="mt-2 text-xs md:text-sm text-[#4a6fa5] font-bold uppercase tracking-widest">
              Generador de puteadas nivel dios
            </p>
          </div>

          {/* Messi */}
          <div className="flex flex-col items-center patron-frame cursor-pointer" title="EL GOAT">
            <div className="relative w-20 h-20 md:w-28 md:h-28 rounded-full overflow-hidden border-4 border-[#F6B40E] shadow-xl float" style={{ animationDelay: "1.5s" }}>
              <Image
                src="/messi.jpg"
                alt="Lionel Messi - El GOAT"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-[#F6B40E]/30 to-transparent" />
            </div>
            <span className="mt-2 text-xs md:text-sm font-black text-[#1a365d] uppercase tracking-wider drop-shadow-sm">
              EL GOAT
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
            className="mega-button w-full py-8 text-2xl md:text-3xl font-black bg-[#F6B40E] hover:bg-[#d99e0a] text-[#1a365d] border-4 border-[#1a365d] rounded-2xl shadow-2xl uppercase tracking-wider disabled:opacity-50"
          >
            {isGenerating ? (
              <span className="flex items-center gap-3">
                <Zap className="w-8 h-8 animate-pulse" />
                PROCESANDO BARDO...
              </span>
            ) : (
              <span className="flex items-center gap-3">
                <Flame className="w-8 h-8" />
                BARDEAR!
                <Flame className="w-8 h-8" />
              </span>
            )}
          </Button>

          {/* Result */}
          {showResult && generatedInsult && (
            <div className="w-full slide-up-bounce">
              <div className="relative bg-white border-4 border-[#1a365d] rounded-2xl shadow-2xl overflow-hidden">
                {/* Decorative top bar */}
                <div className="h-2 rainbow-border" />
                
                <div className="p-6">
                  {/* Meme phrase */}
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Star className="w-5 h-5 text-[#F6B40E] fill-[#F6B40E]" />
                    <span className="text-xs font-black text-[#F6B40E] uppercase tracking-widest">
                      {memePhrase}
                    </span>
                    <Star className="w-5 h-5 text-[#F6B40E] fill-[#F6B40E]" />
                  </div>

                  {/* The insult */}
                  <blockquote className="text-xl md:text-2xl lg:text-3xl font-black text-[#1a365d] text-center leading-tight text-reveal">
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
            <div className="w-full p-8 bg-white/80 border-4 border-[#F6B40E] rounded-2xl text-center">
              <div className="w-24 h-24 mx-auto mb-4 spin-slow">
                <SUN_OF_MAY />
              </div>
              <p className="text-[#1a365d] font-black text-lg uppercase animate-pulse">
                Canalizando la energia del Diego...
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
      `}</style>
    </main>
  );
}
