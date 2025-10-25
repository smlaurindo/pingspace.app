import { Injectable } from "@nestjs/common";
import { TransactionalAdapterDrizzleORM } from "@/drizzle/drizzle.provider";
import { spaceMembers } from "@/spaces/spaces.schema";
import { and, eq } from "drizzle-orm";
import type { SpaceMembershipInfo } from "@/spaces/spaces.types";
import { TransactionHost } from "@nestjs-cls/transactional";
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
      role: membership.role,
      spaceId: membership.spaceId,
      memberId: membership.memberId,
    };

    return membershipInfo;
  }
}
