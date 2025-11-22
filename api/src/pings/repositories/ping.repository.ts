import type { CreatePingData, Ping } from "../types/pings.types";

export abstract class PingRepository {
  /**
   * Create a new ping in a topic
   * @param data - Ping creation data
   * @returns The created ping
   */
  abstract create(data: CreatePingData): Promise<Ping>;
}
