import { ILLMProvider } from '../llm.interface';
import { OpenAIProvider } from './openai.provider';
import { GeminiProvider } from './gemini.provider';

export class FallbackLLMProvider implements ILLMProvider {
  private primary: ILLMProvider;
  private secondary: ILLMProvider;

  constructor(primaryType: string) {
    if (primaryType === 'openai') {
      this.primary = new OpenAIProvider();
      this.secondary = new GeminiProvider();
    } else {
      this.primary = new GeminiProvider();
      this.secondary = new OpenAIProvider();
    }
  }

  initialize(): void {
    try {
      this.primary.initialize();
    } catch (e) {
      console.warn('Failed to initialize primary LLM provider, pre-initializing secondary...', e);
    }
    try {
      this.secondary.initialize();
    } catch (e) {
      console.warn('Failed to initialize secondary LLM provider...', e);
    }
  }

  async generateText(prompt: string, systemPrompt?: string): Promise<string> {
    try {
      return await this.primary.generateText(prompt, systemPrompt);
    } catch (error) {
      console.error(`Primary LLM provider failed, falling back to secondary:`, error);
      try {
        return await this.secondary.generateText(prompt, systemPrompt);
      } catch (secError) {
        console.error(`Secondary LLM provider also failed. Using local heuristic fallback.`, secError);
        return `[Local Heuristic Fallback Response for: ${prompt.substring(0, 50)}]`;
      }
    }
  }

  async extractTags(text: string): Promise<string[]> {
    try {
      return await this.primary.extractTags(text);
    } catch (error) {
      console.error(`Primary LLM tag extraction failed, falling back to secondary:`, error);
      try {
        return await this.secondary.extractTags(text);
      } catch (secError) {
        console.error(`Secondary LLM tag extraction also failed. Using local keyword extraction:`, secError);
        // Simple local backup tag extraction using a basic regex/split
        const keywords = text.toLowerCase()
          .replace(/[^\w\s]/g, '')
          .split(/\s+/)
          .filter(w => w.length > 4 && !['about', 'would', 'could', 'should', 'their', 'there', 'other', 'trade', 'barter'].includes(w));
        return Array.from(new Set(keywords)).slice(0, 5);
      }
    }
  }

  async analyzeListingQuality(text: string): Promise<{ score: number; suggestions: string[] }> {
    try {
      return await this.primary.analyzeListingQuality(text);
    } catch (error) {
      console.error(`Primary LLM quality analysis failed, falling back to secondary:`, error);
      try {
        return await this.secondary.analyzeListingQuality(text);
      } catch (secError) {
        console.error(`Secondary LLM quality analysis failed. Using local heuristics:`, secError);
        // Local heuristic fallback for listing analysis
        const wordCount = text.split(/\s+/).length;
        const suggestions: string[] = [];
        let score = 70;
        if (wordCount < 15) {
          suggestions.push('Provide a longer description to attract more views.');
          score -= 20;
        }
        if (!text.includes('contact') && !text.includes('email') && !text.includes('phone')) {
          suggestions.push('Add contact details for faster responses.');
          score -= 10;
        }
        return { score, suggestions };
      }
    }
  }
}
