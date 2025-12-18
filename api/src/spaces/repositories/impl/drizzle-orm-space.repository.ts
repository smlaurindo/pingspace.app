import { Injectable } from "@nestjs/common";
import { and, count, desc, eq, isNull, max, sql } from "drizzle-orm";
import { TransactionHost } from "@nestjs-cls/transactional";
import { TransactionalAdapterDrizzleORM } from "@/drizzle/drizzle.provider";
import { spaces, spaceMembers, spacePins } from "../../spaces.schema";
import { topics } from "../../topics/topics.schema";
import { pings, pingReads } from "../../topics/pings/pings.schema";
import { SpaceRepository } from "../space.repository";
import {
  CreateSpaceData,
  ListSpacesQuery,
  PaginatedSpacesWithLastPingAtAndUnreadCount,
  SpaceInfo,
} from "../../types/spaces.types";

@Injectable()
export class DrizzleORMSpaceRepository implements SpaceRepository {
  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterDrizzleORM>,
  ) {}

  async checkSpaceExistsById(spaceId: string): Promise<boolean> {
    const result = await this.txHost.tx
      .select({ id: spaces.id })
      .from(spaces)
      .where(eq(spaces.id, spaceId))
      .limit(1);

    const exists = result.length > 0;

    return exists;
  }

  async checkSpaceExistsBySlug(slug: string): Promise<boolean> {
    const result = await this.txHost.tx
      .select({ id: spaces.id })
      .from(spaces)
      .where(eq(spaces.slug, slug))
      .limit(1);

    return result.length > 0;
  }

  async createSpace(data: CreateSpaceData): Promise<string> {
    const [{ spaceId }] = await this.txHost.tx
      .insert(spaces)
      .values({
        name: data.name,
        slug: data.slug,
        shortDescription: data.shortDescription,
        description: data.description,
        ownerId: data.ownerId,
      })
      .returning({ spaceId: spaces.id });

    return spaceId;
  }

  async findSpaceById(spaceId: string): Promise<SpaceInfo | null> {
    const [space] = await this.txHost.tx
      .select({
        id: spaces.id,
        name: spaces.name,
        shortDescription: spaces.shortDescription,
        description: spaces.description,
        memberCount: count(spaceMembers.id).as("member_count"),
      })
      .from(spaces)
      .leftJoin(spaceMembers, eq(spaceMembers.spaceId, spaces.id))
      .where(eq(spaces.id, spaceId))
      .groupBy(spaces.id)
      .limit(1);

    if (!space) return null;

    return {
      id: space.id,
      name: space.name,
      shortDescription: space.shortDescription,
      description: space.description,
      memberCount: Number(space.memberCount),
    };
  }

  async listSpaces({
    memberId,
    cursor,
    limit,
  }: ListSpacesQuery): Promise<PaginatedSpacesWithLastPingAtAndUnreadCount> {
    const conditions = [eq(spaceMembers.memberId, memberId)];

    if (cursor) {
      conditions.push(sql`${spaces.id} < ${cursor}`);
    }

    const unreadCountSubquery = this.txHost.tx
      .select({
        spaceId: topics.spaceId,
        unreadCount: count(pings.id).as("unread_count"),
      })
      .from(pings)
      .innerJoin(topics, eq(topics.id, pings.topicId))
      .innerJoin(spaceMembers, eq(spaceMembers.spaceId, topics.spaceId))
      .leftJoin(
        pingReads,
        and(
          eq(pingReads.pingId, pings.id),
          eq(pingReads.spaceMemberId, spaceMembers.id),
        ),
      )
      .where(and(eq(spaceMembers.memberId, memberId), isNull(pingReads.id)))
      .groupBy(topics.spaceId)
      .as("unread_counts");

    const lastPingSubquery = this.txHost.tx
      .select({
        spaceId: topics.spaceId,
        lastPingAt: max(pings.createdAt).as("last_ping_at"),
      })
      .from(pings)
      .innerJoin(topics, eq(topics.id, pings.topicId))
      .groupBy(topics.spaceId)
      .as("last_pings");

    const order = [
      desc(sql`COALESCE(${spacePins.pinned}, false)`),
      sql`${lastPingSubquery.lastPingAt} DESC NULLS LAST`,
      desc(spaces.id),
    ];

    const results = await this.txHost.tx
      .select({
        id: spaces.id,
        name: spaces.name,
        shortDescription: spaces.shortDescription,
        isPinned: sql<boolean>`COALESCE(${spacePins.pinned}, false)`,
        lastPingAt: lastPingSubquery.lastPingAt,
        unreadCount: sql<number>`COALESCE(${unreadCountSubquery.unreadCount}, 0)`,
      })
      .from(spaces)
      .innerJoin(spaceMembers, eq(spaceMembers.spaceId, spaces.id))
      .leftJoin(
        spacePins,
        and(eq(spacePins.spaceId, spaces.id), eq(spacePins.userId, memberId)),
      )
      .leftJoin(unreadCountSubquery, eq(unreadCountSubquery.spaceId, spaces.id))
      .leftJoin(lastPingSubquery, eq(lastPingSubquery.spaceId, spaces.id))
      .where(and(...conditions))
      .orderBy(...order)
      .limit(limit + 1);

    const hasNextPage = results.length > limit;
    const items = results.slice(0, limit);
    const nextCursor = hasNextPage ? items[items.length - 1].id : null;

    return {
      items: items.map((item) => ({
        id: item.id,
        name: item.name,
        shortDescription: item.shortDescription,
        isPinned: item.isPinned,
        lastPingAt: item.lastPingAt,
        unreadCount: Number(item.unreadCount),
      })),
      pagination: {
        nextCursor,
        hasNextPage,
        limit,
      },
    };
  }

  async deleteSpaceById(spaceId: string): Promise<void> {
    await this.txHost.tx.delete(spaces).where(eq(spaces.id, spaceId));
  }
}
