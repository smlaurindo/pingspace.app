import type {
  CreateTopicData,
  TopicInfo,
  TopicWithUnreadCount,
} from "../types/topics.types";

export abstract class TopicRepository {
  /**
   * Create a new topic in a space
   * @param data - Topic creation data
   * @returns The created topic id
   */
  abstract createTopic(data: CreateTopicData): Promise<{ topicId: string }>;

  /**
   * Find a topic by space id and slug
   * @param spaceId - The space identifier
   * @param slug - The topic slug
   * @returns The topic info or null if not found
   */
  abstract findTopicBySpaceIdAndSlug(
    spaceId: string,
    slug: string,
  ): Promise<TopicInfo | null>;

  /**
   * Find a topic by space id and id
   * @param spaceId - The space identifier
   * @param topicId - The topic identifier
   * @returns The topic info or null if not found
   */
  abstract findTopicBySpaceIdAndId(
    spaceId: string,
    topicId: string,
  ): Promise<TopicInfo | null>;

  /**
   * Check if a topic exists by space id and slug
   * @param spaceId - The space identifier
   * @param slug - The topic slug
   * @returns True if exists, false otherwise
   */
  abstract checkTopicExistsBySpaceIdAndSlug(
    spaceId: string,
    slug: string,
  ): Promise<boolean>;

  /**
   * Check if a topic exists by space id and id
   * @param spaceId - The space identifier
   * @param topicId - The topic identifier
   */
  abstract checkTopicExistsBySpaceIdAndId(
    spaceId: string,
    topicId: string,
  ): Promise<boolean>;

  /**
   * List topics in a space for a member with unread ping counts
   * @param spaceId - The space identifier
   * @param spaceMemberId - The space member identifier
   * @returns The list of topics with unread ping counts
   */
  abstract listTopicsBySpaceIdAndSpaceMemberId(
    spaceId: string,
    spaceMemberId: string,
  ): Promise<TopicWithUnreadCount[]>;

  /**
   * Delete a topic by id
   * @param topicId - The topic identifier
   */
  abstract deleteTopicById(topicId: string): Promise<void>;
}
