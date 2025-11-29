import { Injectable } from "@nestjs/common";
import { Transactional } from "@nestjs-cls/transactional";
import { randomBytes } from "node:crypto";
import { hash } from "bcrypt";
import { ConfigService } from "@/config/config.service";
import { SpaceSlugAlreadyExistsException } from "./exceptions/space-slug-already-exists.exception";
import { SpaceRepository } from "./repositories/space.repository";
import { SpaceNotFoundException } from "./exceptions/space-not-found.exception";
import { SpaceMembershipRepository } from "./repositories/space-membership.repository";
import { InsufficientSpacePermissionsException } from "./exceptions/insufficient-space-permissions.exception";
import { UnauthorizedSpaceAccessException } from "./exceptions/unauthorized-space-access.exception";
import { SPACE_ROLE_ADMIN, SPACE_ROLE_OWNER } from "./spaces.schema";
import { SpaceApiKeyRepository } from "./repositories/space-api-key.repository";
import type {
  CreateSpaceApiKeyRequest,
  CreateSpaceApiKeyResponse,
  CreateSpaceRequest,
  CreateSpaceResponse,
  DeleteSpaceRequest,
  ListSpaceApiKeysRequest,
  ListSpaceApiKeysResponse,
} from "./types/spaces.dto";
import { TransactionalAdapterDrizzleORM } from "@/drizzle/drizzle.provider";

@Injectable()
export class SpacesService {
  public constructor(
    private readonly spaceRepository: SpaceRepository,
    private readonly spaceMembershipRepository: SpaceMembershipRepository,
    private readonly spaceApiKeyRepository: SpaceApiKeyRepository,
    private readonly configService: ConfigService,
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

    const [spaceExists, spaceMember] = await Promise.all([
      this.spaceRepository.checkSpaceExists(spaceId),
      this.spaceMembershipRepository.findBySpaceAndUser(spaceId, userId),
    ]);

    if (!spaceExists) {
      throw new SpaceNotFoundException(spaceId);
    }

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

  @Transactional()
  async createApiKey(
    request: CreateSpaceApiKeyRequest,
  ): Promise<CreateSpaceApiKeyResponse> {
    const { spaceId, userId, name, description } = request;

    const [spaceExists, spaceMembership] = await Promise.all([
      this.spaceRepository.checkSpaceExists(spaceId),
      this.spaceMembershipRepository.findBySpaceAndUser(spaceId, userId),
    ]);

    if (!spaceExists) throw new SpaceNotFoundException(spaceId);

    if (!spaceMembership) {
      throw new UnauthorizedSpaceAccessException(
        spaceId,
        "You must be a member of the space to create API keys.",
      );
    }

    const canCreate = [SPACE_ROLE_OWNER, SPACE_ROLE_ADMIN].includes(
      spaceMembership.role,
    );

    if (!canCreate) {
      throw new InsufficientSpacePermissionsException(
        spaceId,
        ["OWNER", "ADMIN"],
        "create API keys.",
      );
    }

    const hashSalt = this.configService.get("cryptography.hashSalt", {
      infer: true,
    });

    const rawSecret = randomBytes(48).toString("base64url");
    const keyHash = await hash(rawSecret, hashSalt);

    const apiKey = await this.spaceApiKeyRepository.create({
      spaceId,
      keyHash,
      name,
      description,
      createdBy: userId,
    });

    return {
      id: apiKey.id,
      name: apiKey.name,
      description: apiKey.description,
      key: `${apiKey.id}.${rawSecret}`,
      createdAt: apiKey.createdAt,
    };
  }

  @Transactional<TransactionalAdapterDrizzleORM>({ accessMode: "read only" })
  async listApiKeys(
    request: ListSpaceApiKeysRequest,
  ): Promise<ListSpaceApiKeysResponse> {
    const { spaceId, userId, cursor, limit, type } = request;

    const [spaceExists, spaceMembership, result] = await Promise.all([
      this.spaceRepository.checkSpaceExists(spaceId),
      this.spaceMembershipRepository.findBySpaceAndUser(spaceId, userId),
      this.spaceApiKeyRepository.listBySpace({
        spaceId,
        cursor,
        limit,
        type,
      }),
    ]);

    if (!spaceExists) throw new SpaceNotFoundException(spaceId);

    if (!spaceMembership) {
      throw new UnauthorizedSpaceAccessException(
        spaceId,
        "You must be a member of the space to list API keys.",
      );
    }

    const canList = [SPACE_ROLE_OWNER, SPACE_ROLE_ADMIN].includes(
      spaceMembership.role,
    );

    if (!canList) {
      throw new InsufficientSpacePermissionsException(
        spaceId,
        ["OWNER", "ADMIN"],
        "list API keys.",
      );
    }

    return result;
  }
}
