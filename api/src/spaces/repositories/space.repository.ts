import {
  CreateSpaceData,
  ListSpacesQuery,
  PaginatedSpacesWithLastPingAtAndUnreadCount,
  SpaceInfo,
} from "../types/spaces.types";

export abstract class SpaceRepository {
  /**
   * Check if a space exists by ID
   * @param spaceId - The space identifier
   * @returns True if the space exists, false otherwise
   */
  abstract checkSpaceExistsById(spaceId: string): Promise<boolean>;

  /**
   * Check if a space with the given slug exists
   * @param slug - The space slug
   * @returns True if the space exists, false otherwise
   */
  abstract checkSpaceExistsBySlug(slug: string): Promise<boolean>;

  /**
   * Create a new space
   * @param data - The space data
   * @returns The created space ID
   */
  abstract createSpace(data: CreateSpaceData): Promise<string>;

  /**
   * Find a space by ID
   * @param spaceId - The space identifier
   * @returns The space data
   */
  abstract findSpaceById(spaceId: string): Promise<SpaceInfo | null>;

  /**
   * List spaces for a member with pagination
   * @param query - The list spaces query
   * @returns A paginated list of spaces with last ping at and unread count
   */
  abstract listSpaces(
    query: ListSpacesQuery,
  ): Promise<PaginatedSpacesWithLastPingAtAndUnreadCount>;

  /**
   * Delete a space by ID
   * @param spaceId - The space identifier
   */
  abstract deleteSpaceById(spaceId: string): Promise<void>;
}
