import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { SpaceMembershipInfo } from "@/spaces/spaces.types";

export const SpaceMembership = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): SpaceMembershipInfo => {
    const request = ctx.switchToHttp().getRequest();
    return request.spaceMembership as SpaceMembershipInfo;
  },
);
