import { ILLMProvider } from './llm.interface';
import { FallbackLLMProvider } from './providers/fallback.provider';

export class LLMFactory {
  private static instance: ILLMProvider;

  /**
   * Retrieves the singleton instance of the configured LLM provider.
   * Resolves the provider based on the LLM_PROVIDER environment variable.
   */
  public static getProvider(): ILLMProvider {
    if (!this.instance) {
      const providerType = process.env.LLM_PROVIDER?.toLowerCase() || 'gemini';
      this.instance = new FallbackLLMProvider(providerType);
      this.instance.initialize();
    }
    return this.instance;
  }
}
