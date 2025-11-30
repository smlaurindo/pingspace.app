import type {
  CreatePingData,
  ListPingQuery,
  PaginatedPings,
  Ping,
  ReadByTopicData,
} from "../types/pings.types";

export abstract class PingRepository {
  /**
   * List pings by topic with pagination
   * @param query - Query parameters for listing pings
   * @returns Paginated list of pings
   */
  abstract listByTopic(query: ListPingQuery): Promise<PaginatedPings>;

  /**
   * Create a new ping in a topic
   * @param data - Ping creation data
   * @returns The created ping
   */
  abstract create(data: CreatePingData): Promise<Ping>;

  /**
   * Mark pings as read by topic for a user up to a specific timestamp
   * @param data - Data containing spaceId, topicId, userId, and timestamp
   */
  abstract readByTopic(data: ReadByTopicData): Promise<void>;
}
