import { CreateSpaceData } from "../spaces.types";

export abstract class SpaceRepository {
  /**
   * Check if a space exists by ID
   * @param spaceId - The space identifier
   * @returns True if the space exists, false otherwise
   */
  abstract checkSpaceExists(spaceId: string): Promise<boolean>;

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
   * Delete a space by ID
   * @param spaceId - The space identifier
   */
  abstract deleteSpace(spaceId: string): Promise<void>;
}
