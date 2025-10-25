import { Injectable } from "@nestjs/common";
import { Transactional } from "@nestjs-cls/transactional";
import type {
  CreateSpaceRequest,
  CreateSpaceResponse,
  DeleteSpaceRequest,
} from "./spaces.dto";
import { SpaceSlugAlreadyExistsException } from "./exceptions/space-slug-already-exists.exception";
import { SpaceRepository } from "./repositories/space.repository";
import { SpaceNotFoundException } from "./exceptions/space-not-found.exception";
import { SpaceMembershipRepository } from "./repositories/space-membership.repository";
import { InsufficientSpacePermissionsException } from "./exceptions/insufficient-space-permissions.exception";
import { UnauthorizedSpaceAccessException } from "./exceptions/unauthorized-space-access.exception";
import { SPACE_ROLE_OWNER } from "./spaces.schema";

@Injectable()
export class SpacesService {
  public constructor(
    private readonly spaceRepository: SpaceRepository,
    private readonly spaceMembershipRepository: SpaceMembershipRepository,
  ) {}

  @Transactional()
  async createSpace(request: CreateSpaceRequest): Promise<CreateSpaceResponse> {
    const { name, shortDescription, description, slug, userId } = request;

    const finalSlug =
      slug ||
      name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    const slugExists =
      await this.spaceRepository.checkSpaceExistsBySlug(finalSlug);

    if (slugExists) {
      throw new SpaceSlugAlreadyExistsException(finalSlug);
    }

    const spaceId = await this.spaceRepository.createSpace({
      name,
      slug: finalSlug,
      shortDescription,
      description,
      ownerId: userId,
    });

    await this.spaceMembershipRepository.createMembership({
      spaceId,
      memberId: userId,
      role: SPACE_ROLE_OWNER,
    });

    return { spaceId };
  }

  @Transactional()
  async deleteSpace(request: DeleteSpaceRequest): Promise<void> {
    const { spaceId, userId } = request;

    const spaceExists = await this.spaceRepository.checkSpaceExists(spaceId);

    if (!spaceExists) {
      throw new SpaceNotFoundException(spaceId);
    }

    const spaceMember = await this.spaceMembershipRepository.findBySpaceAndUser(
      spaceId,
      userId,
    );

    if (!spaceMember) {
      throw new UnauthorizedSpaceAccessException(spaceId);
    }

    const userIsOwnerOfSpace = spaceMember.role === "OWNER";

    if (!userIsOwnerOfSpace) {
      throw new InsufficientSpacePermissionsException(
        spaceId,
        ["OWNER"],
        "delete this space",
      );
    }

    await this.spaceRepository.deleteSpace(spaceId);
  }
}
