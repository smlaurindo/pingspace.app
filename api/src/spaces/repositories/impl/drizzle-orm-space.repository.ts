import { Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { TransactionHost } from "@nestjs-cls/transactional";
import { TransactionalAdapterDrizzleORM } from "@/drizzle/drizzle.provider";
import { spaces } from "@/spaces/spaces.schema";
import { SpaceRepository } from "../space.repository";
import { CreateSpaceData } from "@/spaces/spaces.types";

@Injectable()
export class DrizzleORMSpaceRepository implements SpaceRepository {
  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterDrizzleORM>,
  ) {}

  async checkSpaceExists(spaceId: string): Promise<boolean> {
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

  async deleteSpace(spaceId: string): Promise<void> {
    await this.txHost.tx.delete(spaces).where(eq(spaces.id, spaceId));
  }
}
