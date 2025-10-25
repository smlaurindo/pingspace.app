import { Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { TransactionHost } from "@nestjs-cls/transactional";
import { TransactionalAdapterDrizzleORM } from "@/drizzle/drizzle.provider";
import { spaces } from "@/spaces/spaces.schema";
import { SpaceRepository } from "../space.repository";

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
}
