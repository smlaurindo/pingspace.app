import { Injectable } from "@nestjs/common";
import { TransactionHost } from "@nestjs-cls/transactional";
import { and, eq } from "drizzle-orm";
import { TransactionalAdapterDrizzleORM } from "@/drizzle/drizzle.provider";
import { spaceMembers } from "../../spaces.schema";
import type {
  CreateSpaceMemberData,
  SpaceMember,
} from "../../types/spaces.types";
import { SpaceMemberRepository } from "../space-member.repository";

@Injectable()
export class DrizzleORMRepositorySpaceMember implements SpaceMemberRepository {
  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterDrizzleORM>,
  ) {}

  async findSpaceMemberBySpaceIdAndMemberId(
    spaceId: string,
    memberId: string,
  ): Promise<SpaceMember | null> {
    const [spaceMember] = await this.txHost.tx
      .select({
        id: spaceMembers.id,
        role: spaceMembers.role,
        spaceId: spaceMembers.spaceId,
        memberId: spaceMembers.memberId,
      })
      .from(spaceMembers)
      .where(
        and(
          eq(spaceMembers.spaceId, spaceId),
          eq(spaceMembers.memberId, memberId),
        ),
      )
      .limit(1);

    if (!spaceMember) {
      return null;
    }

    return spaceMember;
  }

  async createSpaceMember(data: CreateSpaceMemberData): Promise<void> {
    await this.txHost.tx.insert(spaceMembers).values({
      ...data,
    });
  }
}
