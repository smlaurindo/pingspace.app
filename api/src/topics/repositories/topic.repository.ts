import type { CreateTopicData, TopicInfo } from "../topics.types";

export abstract class TopicRepository {
  /**
   * Create a new topic in a space
   * @param data - Topic creation data
   * @returns The created topic ID
   */
  abstract create(data: CreateTopicData): Promise<{ topicId: string }>;

  /**
   * Find a topic by space ID and slug
   * @param spaceId - The space identifier
   * @param slug - The topic slug
   * @returns The topic info or null if not found
   */
  abstract findBySpaceAndSlug(
    spaceId: string,
    slug: string,
  ): Promise<TopicInfo | null>;

  /**
   * Check if a topic exists by space ID and slug
   * @param spaceId - The space identifier
   * @param slug - The topic slug
   * @returns True if exists, false otherwise
   */
  abstract existsBySpaceAndSlug(
    spaceId: string,
    slug: string,
  ): Promise<boolean>;
}
