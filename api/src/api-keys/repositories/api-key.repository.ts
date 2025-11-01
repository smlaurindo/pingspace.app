import type { ApiKey, CreateApiKeyData } from "../types/api-keys.types";

export abstract class ApiKeyRepository {
  /**
   * Create a new API key for a space
   * @param data - API key creation data
   * @returns The created API key
   */
  abstract create(data: CreateApiKeyData): Promise<ApiKey>;

  /**
   * Find an API key by its ID
   * @param apiKeyId - The API key ID
   * @returns The API key or null if not found
   */
  abstract findById(apiKeyId: string): Promise<ApiKey | null>;

  /**
   * Update the last used timestamp of an API key
   * @param apiKeyId - The API key ID
   */
  abstract updateLastUsed(apiKeyId: string): Promise<void>;
}
