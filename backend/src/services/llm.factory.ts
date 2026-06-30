import { ILLMProvider } from './llm.interface';
import { OpenAIProvider } from './providers/openai.provider';
import { GeminiProvider } from './providers/gemini.provider';

export class LLMFactory {
  private static instance: ILLMProvider;

  /**
   * Retrieves the singleton instance of the configured LLM provider.
   * Resolves the provider based on the LLM_PROVIDER environment variable.
   */
  public static getProvider(): ILLMProvider {
    if (!this.instance) {
      const providerType = process.env.LLM_PROVIDER?.toLowerCase() || 'mock';

      switch (providerType) {
        case 'openai':
          this.instance = new OpenAIProvider();
          break;
        case 'gemini':
          this.instance = new GeminiProvider();
          break;
        case 'mock':
        default:
          // Fallback to a mock/stub provider if none is specified or available
          console.warn('No LLM_PROVIDER specified or unrecognized. Using fallback/mock provider.');
          this.instance = new GeminiProvider(); // Using Gemini stub as fallback
          break;
      }

      this.instance.initialize();
    }
    return this.instance;
  }
}
