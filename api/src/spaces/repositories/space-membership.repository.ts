import type { SpaceMembershipInfo } from "@/spaces/spaces.types";

export abstract class SpaceMembershipRepository {
  /**
   * Find a space membership by space ID and user ID
   * @param spaceId - The space identifier
   * @param userId - The user identifier
   * @returns The membership info or null if not found
   */
  abstract findBySpaceAndUser(
    spaceId: string,
    userId: string,
  ): Promise<SpaceMembershipInfo | null>;
}
