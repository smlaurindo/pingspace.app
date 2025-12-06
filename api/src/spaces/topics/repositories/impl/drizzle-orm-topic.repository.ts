import { Injectable } from "@nestjs/common";
import { TransactionalAdapterDrizzleORM } from "@/drizzle/drizzle.provider";
import { TransactionHost } from "@nestjs-cls/transactional";
import { topics } from "@/spaces/topics/topics.schema";
import { and, count, eq, isNull, sql } from "drizzle-orm";
import { TopicRepository } from "../topic.repository";
import {
  CreateTopicData,
  TopicInfo,
  TopicWithUnreadCount,
} from "../../types/topics.types";
import { pings, pingReads } from "../../pings/pings.schema";

@Injectable()
export class DrizzleORMTopicRepository implements TopicRepository {
  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterDrizzleORM>,
  ) {}

  async createTopic(data: CreateTopicData): Promise<{ topicId: string }> {
    const [{ topicId }] = await this.txHost.tx
      .insert(topics)
      .values({
        ...data,
      })
      .returning({ topicId: topics.id });

    return { topicId };
  }

  async findTopicBySpaceIdAndSlug(
    spaceId: string,
    slug: string,
  ): Promise<TopicInfo | null> {
    const [topic] = await this.txHost.tx
      .select({
        id: topics.id,
        spaceId: topics.spaceId,
        name: topics.name,
        slug: topics.slug,
        emoji: topics.emoji,
        shortDescription: topics.shortDescription,
        description: topics.description,
        createdAt: topics.createdAt,
        updatedAt: topics.updatedAt,
      })
      .from(topics)
      .where(and(eq(topics.spaceId, spaceId), eq(topics.slug, slug)))
      .limit(1);

    if (!topic) {
      return null;
    }

    return topic;
  }

  async findBySlug(slug: string): Promise<TopicInfo | null> {
    const [topic] = await this.txHost.tx
      .select({
        id: topics.id,
        spaceId: topics.spaceId,
        name: topics.name,
        slug: topics.slug,
        emoji: topics.emoji,
        shortDescription: topics.shortDescription,
        description: topics.description,
        createdAt: topics.createdAt,
        updatedAt: topics.updatedAt,
      })
      .from(topics)
      .where(eq(topics.slug, slug))
      .limit(1);

    if (!topic) {
      return null;
    }

    return topic;
  }

  async findTopicBySpaceIdAndId(
    spaceId: string,
    topicId: string,
  ): Promise<TopicInfo | null> {
    const [topic] = await this.txHost.tx
      .select({
        id: topics.id,
        spaceId: topics.spaceId,
        name: topics.name,
        slug: topics.slug,
        emoji: topics.emoji,
        shortDescription: topics.shortDescription,
        description: topics.description,
        createdAt: topics.createdAt,
        updatedAt: topics.updatedAt,
      })
      .from(topics)
      .where(and(eq(topics.spaceId, spaceId), eq(topics.id, topicId)))
      .limit(1);

    if (!topic) {
      return null;
    }

    return topic;
  }

  async listTopicsBySpaceIdAndSpaceMemberId(
    spaceId: string,
    spaceMemberId: string,
  ): Promise<TopicWithUnreadCount[]> {
    const unreadCountSubquery = this.txHost.tx
      .select({
        topicId: pings.topicId,
        unreadCount: count(pings.id).as("unread_count"),
      })
      .from(pings)
      .leftJoin(
        pingReads,
        and(
          eq(pingReads.pingId, pings.id),
          eq(pingReads.spaceMemberId, spaceMemberId),
        ),
      )
      .where(isNull(pingReads.id))
      .groupBy(pings.topicId)
      .as("unread_pings");

    const topicResults = await this.txHost.tx
      .select({
        id: topics.id,
        spaceId: topics.spaceId,
        name: topics.name,
        slug: topics.slug,
        emoji: topics.emoji,
        shortDescription: topics.shortDescription,
        description: topics.description,
        createdAt: topics.createdAt,
        updatedAt: topics.updatedAt,
        unreadCount: sql`COALESCE(${unreadCountSubquery.unreadCount}, 0)`,
      })
      .from(topics)
      .leftJoin(unreadCountSubquery, eq(topics.id, unreadCountSubquery.topicId))
      .where(eq(topics.spaceId, spaceId));

    return topicResults.map((topic) => ({
      ...topic,
      unreadCount: Number(topic.unreadCount),
    }));
  }

  async checkTopicExistsBySpaceIdAndSlug(
    spaceId: string,
    slug: string,
  ): Promise<boolean> {
    const [result] = await this.txHost.tx
      .select({ id: topics.id })
      .from(topics)
      .where(and(eq(topics.spaceId, spaceId), eq(topics.slug, slug)))
      .limit(1);

    return !!result;
  }

  async checkTopicExistsBySpaceIdAndId(
    spaceId: string,
    topicId: string,
  ): Promise<boolean> {
    const [result] = await this.txHost.tx
      .select({ id: topics.id })
      .from(topics)
      .where(and(eq(topics.spaceId, spaceId), eq(topics.id, topicId)))
      .limit(1);

    return !!result;
  }

  async deleteTopicById(topicId: string): Promise<void> {
    await this.txHost.tx.delete(topics).where(eq(topics.id, topicId));
  }
}
