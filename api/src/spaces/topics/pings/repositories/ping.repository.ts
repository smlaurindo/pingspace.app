import type {
  CreatePingData,
  ListPingQuery,
  PaginatedPings,
  Ping,
  ReadByTopicData,
} from "../types/pings.types";

export abstract class PingRepository {
  /**
   * List pings with pagination
   * @param query - Query parameters for listing pings
   * @returns Paginated list of pings
   */
  abstract listPings(query: ListPingQuery): Promise<PaginatedPings>;

  /**
   * Create a new ping
   * @param data - Ping creation data
   * @returns The created ping
   */
  abstract createPing(data: CreatePingData): Promise<Ping>;

  /**
   * Mark pings as read by topic for a user up to a specific timestamp
   * @param data - Data containing spaceId, topicId, userId, and timestamp
   */
  abstract readPings(data: ReadByTopicData): Promise<void>;
}
