import { INSULTOS } from '@/data/insultos';

export const RAW_DATA: string[] = INSULTOS;

type NGramKey = string | [string, string] | [string, string, string] | [string, string, string, string];
type MarkovChain = Map<string, string[]>;

interface WordFrequency {
  word: string;
  count: number;
}

export class MarkovGenerator {
  private chain: MarkovChain = new Map();
  private startWords: string[] = [];
  private originalPhrases: Set<string>;
  private maxContextSize: number = 4;

  constructor(data: string[]) {
    this.originalPhrases = new Set(data.map(phrase => phrase.toLowerCase().trim()));
    this.buildChain(data);
  }

  private buildChain(data: string[]): void {
    for (const phrase of data) {
      this.addDocument(phrase, this.maxContextSize);
    }
  }

  private addDocument(text: string, maxContext: number): void {
    // Agregar token de fin de frase
    const textWithEnd = text + " <end>";
    const words = textWithEnd.toLowerCase().split(/\s+/).filter(w => w.length > 0);
    
    if (words.length === 0) return;

    // Store first word as a possible start
    this.startWords.push(words[0]);

    // Generate n-grams of different sizes
    // 1-word context
    for (let i = 0; i < words.length - 1; i++) {
      const key = words[i];
      const nextWord = words[i + 1];
      this.addToChain(key, nextWord);
    }

    // 2-word context
    if (maxContext >= 2) {
      for (let i = 0; i < words.length - 2; i++) {
        const key = JSON.stringify([words[i], words[i + 1]]);
        const nextWord = words[i + 2];
        this.addToChain(key, nextWord);
      }
    }

    // 3-word context
    if (maxContext >= 3) {
      for (let i = 0; i < words.length - 3; i++) {
        const key = JSON.stringify([words[i], words[i + 1], words[i + 2]]);
        const nextWord = words[i + 3];
        this.addToChain(key, nextWord);
      }
    }

    // 4-word context
    if (maxContext >= 4) {
      for (let i = 0; i < words.length - 4; i++) {
        const key = JSON.stringify([words[i], words[i + 1], words[i + 2], words[i + 3]]);
        const nextWord = words[i + 4];
        this.addToChain(key, nextWord);
      }
    }
  }

  private addToChain(key: string, nextWord: string): void {
    if (!this.chain.has(key)) {
      this.chain.set(key, []);
    }
    this.chain.get(key)!.push(nextWord);
  }

  private getRandomElement<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  private getMostCommon(words: string[], limit: number = 10): WordFrequency[] {
    const counts = new Map<string, number>();
    for (const word of words) {
      counts.set(word, (counts.get(word) || 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  private getNextWords(context: string): WordFrequency[] {
    const suggestions = this.chain.get(context);
    if (!suggestions || suggestions.length === 0) {
      return [];
    }
    return this.getMostCommon(suggestions, 5);
  }

  generate(startWord?: string): string {
    let attempts = 0;
    const maxAttempts = 50;

    while (attempts < maxAttempts) {
      const result = this.generateOnce(startWord);
      
      // Verificar que no sea idéntica a una frase original
      if (!this.originalPhrases.has(result.toLowerCase().trim())) {
        return result;
      }
      attempts++;
    }

    // Si después de muchos intentos no genera algo nuevo, devolver igual
    return this.generateOnce(startWord);
  }

  private generateOnce(startWord?: string): string {
    const words: string[] = [];
    
    // Determine starting word
    let currentWord: string;
    if (startWord) {
      const lowerStart = startWord.toLowerCase();
      const matchingStarts = this.startWords.filter(w => w.startsWith(lowerStart));
      currentWord = matchingStarts.length > 0 
        ? this.getRandomElement(matchingStarts)
        : this.getRandomElement(this.startWords);
    } else {
      currentWord = this.getRandomElement(this.startWords);
    }

    words.push(currentWord);

    // Generate subsequent words until we hit <end> token
    let maxIterations = 100; // Prevención de bucles infinitos
    while (currentWord !== '<end>' && maxIterations > 0) {
      maxIterations--;
      let nextWordOptions: WordFrequency[] = [];

      // Try 4-word context first
      if (words.length >= 4) {
        const key4 = JSON.stringify(words.slice(-4));
        nextWordOptions = this.getNextWords(key4);
        if (nextWordOptions.length > 0) {
          currentWord = nextWordOptions[0].word;
          words.push(currentWord);
          continue;
        }
      }

      // Fall back to 3-word context
      if (words.length >= 3) {
        const key3 = JSON.stringify(words.slice(-3));
        nextWordOptions = this.getNextWords(key3);
        if (nextWordOptions.length > 0) {
          currentWord = nextWordOptions[0].word;
          words.push(currentWord);
          continue;
        }
      }

      // Fall back to 2-word context
      if (words.length >= 2) {
        const key2 = JSON.stringify(words.slice(-2));
        nextWordOptions = this.getNextWords(key2);
        if (nextWordOptions.length > 0) {
          currentWord = nextWordOptions[0].word;
          words.push(currentWord);
          continue;
        }
      }

      // Fall back to 1-word context
      const key1 = words[words.length - 1];
      nextWordOptions = this.getNextWords(key1);
      if (nextWordOptions.length > 0) {
        currentWord = nextWordOptions[0].word;
        words.push(currentWord);
      } else {
        // No more options, end generation
        break;
      }
    }

    // Remove the <end> token before returning
    return words.filter(w => w !== '<end>').join(' ');
  }
}

// Instancia singleton del generador
let generatorInstance: MarkovGenerator | null = null;

export function getGenerator(): MarkovGenerator {
  if (!generatorInstance) {
    generatorInstance = new MarkovGenerator(RAW_DATA);
  }
  return generatorInstance;
}

export function generateInsult(startWord?: string): string {
  return getGenerator().generate(startWord);
}
