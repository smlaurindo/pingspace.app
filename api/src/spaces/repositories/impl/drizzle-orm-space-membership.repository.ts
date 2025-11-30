import { Injectable } from "@nestjs/common";
import { TransactionHost } from "@nestjs-cls/transactional";
import { and, eq } from "drizzle-orm";
import { TransactionalAdapterDrizzleORM } from "@/drizzle/drizzle.provider";
import { spaceMembers } from "../../spaces.schema";
import type {
  CreateMembershipData,
  SpaceMembershipInfo,
} from "../../types/spaces.types";
import { SpaceMembershipRepository } from "../space-membership.repository";

@Injectable()
export class DrizzleORMRepositorySpaceMembership
  implements SpaceMembershipRepository
{
  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterDrizzleORM>,
  ) {}

  async findBySpaceAndUser(
    spaceId: string,
    userId: string,
  ): Promise<SpaceMembershipInfo | null> {
    const [membership] = await this.txHost.tx
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
          eq(spaceMembers.memberId, userId),
        ),
      )
      .limit(1);

    if (!membership) {
      return null;
    }

    const membershipInfo: SpaceMembershipInfo = {
      id: membership.id,
      role: membership.role,
      spaceId: membership.spaceId,
      memberId: membership.memberId,
    };

    return membershipInfo;
  }

  async createMembership(data: CreateMembershipData): Promise<void> {
    await this.txHost.tx.insert(spaceMembers).values({
      ...data,
    });
  }
}
