import {
  CreateSpaceApiKeyData,
  ListSpaceApiKeyQuery,
  PaginatedSpaceApiKeys,
  SpaceApiKey,
} from "../types/spaces.types";

export abstract class SpaceApiKeyRepository {
  /**
   * Create a new API key for a space
   * @param data - API key creation data
   * @returns The created API key
   */
  abstract createSpaceApiKey(data: CreateSpaceApiKeyData): Promise<SpaceApiKey>;

  /**
   * Find an API key by its ID
   * @param spaceApiKeyId - The API key ID
   * @returns The API key or null if not found
   */
  abstract findSpaceApiKeyById(
    spaceApiKeyId: string,
  ): Promise<SpaceApiKey | null>;

  /**
   * Update the last used timestamp of an API key
   * @param spaceApiKeyId - The API key ID
   */
  abstract updateSpaceApiKeyLastUsedById(spaceApiKeyId: string): Promise<void>;

  abstract listSpaceApiKeys(
    query: ListSpaceApiKeyQuery,
  ): Promise<PaginatedSpaceApiKeys>;
}
