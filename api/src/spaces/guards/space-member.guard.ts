import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { UnauthorizedSpaceAccessException } from "@/spaces/exceptions/unauthorized-space-access.exception";
import { SpaceNotFoundException } from "@/spaces/exceptions/space-not-found.exception";
import { Reflector } from "@nestjs/core";
import { REQUIRED_ROLES_KEY } from "@/spaces/decorators/space-roles.decorator";
import { SpaceMembershipRepository } from "../repositories/space-membership.repository";
import { SpaceRepository } from "../repositories/space.repository";

@Injectable()
export class SpaceMemberGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly membershipRepository: SpaceMembershipRepository,
    private readonly spaceRepository: SpaceRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { spaceId } = request.params;
    const user = request.user;

    if (!spaceId) {
      return true;
    }

    if (!user || !user.sub) {
      throw new UnauthorizedSpaceAccessException(spaceId);
    }

    const spaceExists = await this.spaceRepository.checkSpaceExists(spaceId);

    if (!spaceExists) {
      throw new SpaceNotFoundException(spaceId);
    }

    const membership = await this.membershipRepository.findBySpaceAndUser(
      spaceId,
      user.sub,
    );

    if (!membership) {
      throw new UnauthorizedSpaceAccessException(spaceId);
    }

    request.spaceMembership = membership;

    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      REQUIRED_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (requiredRoles && requiredRoles.length > 0) {
      const hasRole = requiredRoles.includes(membership.role);

      if (!hasRole) {
        throw new UnauthorizedSpaceAccessException(spaceId);
      }
    }

    return true;
  }
}
