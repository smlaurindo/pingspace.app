import type { CreateSpaceMemberData, SpaceMember } from "../types/spaces.types";

export abstract class SpaceMemberRepository {
  /**
   * Find a space member by space ID and member ID
   * @param spaceId - The space identifier
   * @param memberId - The member identifier
   * @returns The member or null if not found
   */
  abstract findSpaceMemberBySpaceIdAndMemberId(
    spaceId: string,
    memberId: string,
  ): Promise<SpaceMember | null>;

  /**
   * Create a space member
   * @param data - The member data
   */
  abstract createSpaceMember(data: CreateSpaceMemberData): Promise<void>;
}
