import { Inject, Injectable } from "@nestjs/common";
import { Transactional } from "@nestjs-cls/transactional";
import { eq } from "drizzle-orm";
import {
  DrizzleAsyncProvider,
  type DrizzleDatabase,
} from "@/drizzle/drizzle.provider";
import type {
  CreateSpaceRequest,
  CreateSpaceResponse,
  DeleteSpaceRequest,
} from "./spaces.dto";
import { spaceMembers, spaces } from "./spaces.schema";
import { SpaceSlugAlreadyExistsException } from "./exceptions/space-slug-already-exists.exception";
import { SpaceRepository } from "./repositories/space.repository";
import { SpaceNotFoundException } from "./exceptions/space-not-found.exception";
import { SpaceMembershipRepository } from "./repositories/space-membership.repository";
import { InsufficientSpacePermissionsException } from "./exceptions/insufficient-space-permissions.exception";
import { UnauthorizedSpaceAccessException } from "./exceptions/unauthorized-space-access.exception";

@Injectable()
export class SpacesService {
  public constructor(
    @Inject(DrizzleAsyncProvider)
    private readonly db: DrizzleDatabase,
    private readonly spaceRepository: SpaceRepository,
    private readonly spaceMembershipRepository: SpaceMembershipRepository,
  ) {}

  async createSpace(request: CreateSpaceRequest): Promise<CreateSpaceResponse> {
    const { name, shortDescription, description, slug, ownerId } = request;

    const finalSlug =
      slug ||
      name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    const existingSpace = await this.db
      .select({ id: spaces.id })
      .from(spaces)
      .where(eq(spaces.slug, finalSlug))
      .limit(1);

    if (existingSpace.length > 0) {
      throw new SpaceSlugAlreadyExistsException(finalSlug);
    }

    const { spaceId } = await this.db.transaction(async (tx) => {
      const [{ spaceId }] = await tx
        .insert(spaces)
        .values({
          name,
          slug: finalSlug,
          shortDescription,
          description,
          ownerId,
        })
        .returning({ spaceId: spaces.id });

      await tx.insert(spaceMembers).values({
        spaceId,
        memberId: ownerId,
        role: "OWNER",
      });

      return { spaceId };
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
