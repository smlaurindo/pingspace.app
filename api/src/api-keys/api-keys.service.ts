import { Injectable } from "@nestjs/common";
import { Transactional } from "@nestjs-cls/transactional";
import { randomBytes } from "node:crypto";
import { hash } from "bcrypt";
import { SpaceRepository } from "@/spaces/repositories/space.repository";
import { SpaceMembershipRepository } from "@/spaces/repositories/space-membership.repository";
import { SpaceNotFoundException } from "@/spaces/exceptions/space-not-found.exception";
import { UnauthorizedSpaceAccessException } from "@/spaces/exceptions/unauthorized-space-access.exception";
import { InsufficientSpacePermissionsException } from "@/spaces/exceptions/insufficient-space-permissions.exception";
import { SPACE_ROLE_ADMIN, SPACE_ROLE_OWNER } from "@/spaces/spaces.schema";
import { ConfigService } from "@/config/config.service";
import { ApiKeyRepository } from "./repositories/api-key.repository";
import type {
  CreateApiKeyRequest,
  CreateApiKeyResponse,
} from "./types/api-keys.dto";

@Injectable()
export class ApiKeysService {
  constructor(
    private readonly apiKeyRepository: ApiKeyRepository,
    private readonly spaceRepository: SpaceRepository,
    private readonly spaceMembershipRepository: SpaceMembershipRepository,
    private readonly configService: ConfigService,
  ) {}

  @Transactional()
  async createApiKey(
    request: CreateApiKeyRequest,
  ): Promise<CreateApiKeyResponse> {
    const { spaceId, userId, name, description } = request;

    const spaceExists = await this.spaceRepository.checkSpaceExists(spaceId);

    if (!spaceExists) throw new SpaceNotFoundException(spaceId);

    const spaceMember = await this.spaceMembershipRepository.findBySpaceAndUser(
      spaceId,
      userId,
    );

    if (!spaceMember) {
      throw new UnauthorizedSpaceAccessException(
        spaceId,
        "You must be a member of the space to create API keys.",
      );
    }

    const canCreate = [SPACE_ROLE_OWNER, SPACE_ROLE_ADMIN].includes(
      spaceMember.role,
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

    const apiKey = await this.apiKeyRepository.create({
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
}
