import { Injectable } from "@nestjs/common";
import { TransactionHost } from "@nestjs-cls/transactional";
import { TransactionalAdapterDrizzleORM } from "@/drizzle/drizzle.provider";
import { spacePins } from "../../spaces.schema";
import { SpacePinRepository } from "../space-pin.repository";

@Injectable()
export class DrizzleORMRepositorySpacePin implements SpacePinRepository {
  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterDrizzleORM>,
  ) {}

  async upsertSpacePin(
    spaceId: string,
    userId: string,
    pinned: boolean,
  ): Promise<void> {
    await this.txHost.tx
      .insert(spacePins)
      .values({
        spaceId,
        userId,
        pinned,
      })
      .onConflictDoUpdate({
        target: [spacePins.spaceId, spacePins.userId],
        set: {
          pinned,
          updatedAt: new Date(),
        },
      });
  }
}
