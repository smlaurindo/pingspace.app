import { Injectable } from "@nestjs/common";
import { TransactionalAdapterDrizzleORM } from "@/drizzle/drizzle.provider";
import { TransactionHost } from "@nestjs-cls/transactional";
import { topics } from "@/spaces/topics/topics.schema";
import { and, eq } from "drizzle-orm";
import { TopicRepository } from "../topic.repository";
import { CreateTopicData, TopicInfo } from "../../types/topics.types";

@Injectable()
export class DrizzleORMTopicRepository implements TopicRepository {
  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterDrizzleORM>,
  ) {}

  async create(data: CreateTopicData): Promise<{ topicId: string }> {
    const [{ topicId }] = await this.txHost.tx
      .insert(topics)
      .values({
        ...data,
      })
      .returning({ topicId: topics.id });

    return { topicId };
  }

  async findBySpaceAndSlug(
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

  async findBySpaceAndId(
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

  async existsBySpaceAndSlug(spaceId: string, slug: string): Promise<boolean> {
    const [result] = await this.txHost.tx
      .select({ id: topics.id })
      .from(topics)
      .where(and(eq(topics.spaceId, spaceId), eq(topics.slug, slug)))
      .limit(1);

    return !!result;
  }

  async existsBySpaceAndId(spaceId: string, topicId: string): Promise<boolean> {
    const [result] = await this.txHost.tx
      .select({ id: topics.id })
      .from(topics)
      .where(and(eq(topics.spaceId, spaceId), eq(topics.id, topicId)))
      .limit(1);

    return !!result;
  }

  async deleteById(topicId: string): Promise<void> {
    await this.txHost.tx.delete(topics).where(eq(topics.id, topicId));
  }
}
