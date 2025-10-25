export abstract class SpaceRepository {
  /**
   * Check if a space exists by ID
   * @param spaceId - The space identifier
   * @returns True if the space exists, false otherwise
   */
  abstract checkSpaceExists(spaceId: string): Promise<boolean>;

  /**
   * Delete a space by ID
   * @param spaceId - The space identifier
   */
  abstract deleteSpace(spaceId: string): Promise<void>;
}
