import { Injectable } from "@nestjs/common";
import { TransactionHost } from "@nestjs-cls/transactional";
import { eq } from "drizzle-orm";
import { TransactionalAdapterDrizzleORM } from "@/drizzle/drizzle.provider";
import { SpaceApiKeyRepository } from "../space-api-key.repository";
import { CreateSpaceApiKeyData, SpaceApiKey } from "../../types/spaces.types";
import { spaceApiKeys } from "../../spaces.schema";

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
      .set({ lastUsedAt: new Date().toISOString() })
      .where(eq(spaceApiKeys.id, spaceApiKeyId));
  }
}
