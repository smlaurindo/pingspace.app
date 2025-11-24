import { Injectable } from "@nestjs/common";
import { TransactionHost } from "@nestjs-cls/transactional";
import { eq, desc, lt, and } from "drizzle-orm";
import { TransactionalAdapterDrizzleORM } from "@/drizzle/drizzle.provider";
import { SpaceApiKeyRepository } from "../space-api-key.repository";
import {
  CreateSpaceApiKeyData,
  ListSpaceApiKeyQuery,
  PaginatedSpaceApiKeys,
  SpaceApiKey,
} from "../../types/spaces.types";
import { spaceApiKeys } from "../../spaces.schema";
import { users } from "@/auth/users.schema";

@Injectable()
export class DrizzleORMSpaceApiKeyRepository implements SpaceApiKeyRepository {
  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterDrizzleORM>,
  ) {}

  async create(data: CreateSpaceApiKeyData): Promise<SpaceApiKey> {
    const [apiKey] = await this.txHost.tx
      .insert(spaceApiKeys)
      .values({
        spaceId: data.spaceId,
        keyHash: data.keyHash,
        name: data.name,
        description: data.description,
        createdBy: data.createdBy,
      })
      .returning({
        id: spaceApiKeys.id,
        createdAt: spaceApiKeys.createdAt,
      });

    return {
      id: apiKey.id,
      name: data.name,
      description: data.description ?? null,
      status: "ACTIVE",
      keyHash: data.keyHash,
      spaceId: data.spaceId,
      createdBy: data.createdBy,
      createdAt: apiKey.createdAt,
      lastUsedAt: null,
    };
  }

  async findById(spaceApiKeyId: string): Promise<SpaceApiKey | null> {
    const [apiKey] = await this.txHost.tx
      .select({
        id: spaceApiKeys.id,
        keyHash: spaceApiKeys.keyHash,
        name: spaceApiKeys.name,
        description: spaceApiKeys.description,
        status: spaceApiKeys.status,
        spaceId: spaceApiKeys.spaceId,
        createdAt: spaceApiKeys.createdAt,
        createdBy: spaceApiKeys.createdBy,
        lastUsedAt: spaceApiKeys.lastUsedAt,
      })
      .from(spaceApiKeys)
      .where(eq(spaceApiKeys.id, spaceApiKeyId))
      .limit(1);

    if (!apiKey) {
      return null;
    }

    return apiKey;
  }

  async updateLastUsed(spaceApiKeyId: string): Promise<void> {
    await this.txHost.tx
      .update(spaceApiKeys)
      .set({ lastUsedAt: new Date() })
      .where(eq(spaceApiKeys.id, spaceApiKeyId));
  }

  async listBySpace({
    spaceId,
    limit,
    type,
    cursor,
  }: ListSpaceApiKeyQuery): Promise<PaginatedSpaceApiKeys> {
    const conditions = [
      eq(spaceApiKeys.spaceId, spaceId),
      eq(spaceApiKeys.status, type),
    ];

    if (cursor) {
      conditions.push(lt(spaceApiKeys.createdAt, new Date(cursor)));
    }

    const items = await this.txHost.tx
      .select({
        id: spaceApiKeys.id,
        name: spaceApiKeys.name,
        description: spaceApiKeys.description,
        status: spaceApiKeys.status,
        createdAt: spaceApiKeys.createdAt,
        lastUsedAt: spaceApiKeys.lastUsedAt,
        createdBy: {
          id: users.id,
          nickname: users.nickname,
        },
      })
      .from(spaceApiKeys)
      .leftJoin(users, eq(spaceApiKeys.createdBy, users.id))
      .where(and(...conditions))
      .orderBy(desc(spaceApiKeys.createdAt))
      .limit(limit + 1);

    const hasNextPage = items.length > limit;
    const results = hasNextPage ? items.slice(0, limit) : items;
    const nextCursor = hasNextPage
      ? results[results.length - 1].createdAt.toISOString()
      : null;

    return {
      items: results,
      pagination: {
        nextCursor,
        hasNextPage,
        limit,
      },
    };
  }
}
