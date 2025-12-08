export abstract class SpacePinRepository {
  /**
   * Update or create a space pin for a user
   * @param spaceId - The space identifier
   * @param userId - The user identifier
   * @param pinned - Whether the space is pinned
   */
  abstract upsertSpacePin(
    spaceId: string,
    userId: string,
    pinned: boolean,
  ): Promise<void>;
}
