export interface ILLMProvider {
  /**
   * Initialize the LLM provider (e.g. check API keys)
   */
  initialize(): void;

  /**
   * Generate text based on a prompt
   * @param prompt The input prompt
   * @param systemPrompt Optional system instructions
   */
  generateText(prompt: string, systemPrompt?: string): Promise<string>;

  /**
   * Extract standardized tags or entities from a block of text.
   * Useful for the marketplace to auto-tag listings.
   * @param text The input text to analyze
   */
  extractTags(text: string): Promise<string[]>;

  /**
   * Analyze the quality or sentiment of a listing description.
   * @param text The description to analyze
   */
  analyzeListingQuality(text: string): Promise<{ score: number; suggestions: string[] }>;
}
