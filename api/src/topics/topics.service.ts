import { Injectable } from "@nestjs/common";
import { Transactional } from "@nestjs-cls/transactional";
import { SpaceRepository } from "@/spaces/repositories/space.repository";
import { SpaceNotFoundException } from "@/spaces/exceptions/space-not-found.exception";
import { SpaceMembershipRepository } from "@/spaces/repositories/space-membership.repository";
import { InsufficientSpacePermissionsException } from "@/spaces/exceptions/insufficient-space-permissions.exception";
import { UnauthorizedSpaceAccessException } from "@/spaces/exceptions/unauthorized-space-access.exception";
import { SPACE_ROLE_ADMIN, SPACE_ROLE_OWNER } from "@/spaces/spaces.schema";
import type {
  CreateTopicRequest,
  CreateTopicResponse,
} from "./types/topics.dto";
import { TopicSlugAlreadyExistsException } from "./exceptions/topic-slug-already-exists.exception";
import { TopicRepository } from "./repositories/topic.repository";

@Injectable()
export class TopicsService {
  public constructor(
    private readonly spaceRepository: SpaceRepository,
    private readonly spaceMembershipRepository: SpaceMembershipRepository,
    private readonly topicRepository: TopicRepository,
  ) {}

  @Transactional()
  async createTopic(request: CreateTopicRequest): Promise<CreateTopicResponse> {
    const {
      name,
      emoji,
      shortDescription,
      description,
      slug,
      spaceId,
      userId,
    } = request;

    const spaceExists = await this.spaceRepository.checkSpaceExists(spaceId);

    if (!spaceExists) {
      throw new SpaceNotFoundException(spaceId);
    }

    const spaceMember = await this.spaceMembershipRepository.findBySpaceAndUser(
      spaceId,
      userId,
    );

    if (!spaceMember) {
      throw new UnauthorizedSpaceAccessException(
        spaceId,
        "You must be a member of the space to create topics.",
      );
    }

    const isSpaceMemberAllowedToCreateTopics =
      spaceMember.role === SPACE_ROLE_OWNER ||
      spaceMember.role === SPACE_ROLE_ADMIN;

    if (!isSpaceMemberAllowedToCreateTopics) {
      throw new InsufficientSpacePermissionsException(
        spaceId,
        ["OWNER", "ADMIN"],
        "create topics.",
      );
    }

    // TODO: Ensure consistent slugification across the entire app
    // TODO: Implement logic to ensure that slug generation retries until a unique slug is produced
    const finalSlug =
      slug ||
      name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    const topicSlugAlreadyExists =
      await this.topicRepository.existsBySpaceAndSlug(spaceId, finalSlug);

    if (topicSlugAlreadyExists) {
      throw new TopicSlugAlreadyExistsException(finalSlug);
    }

    const { topicId } = await this.topicRepository.create({
      spaceId,
      name,
      emoji,
      slug: finalSlug,
      shortDescription,
      description,
    });

    return { topicId };
  }
}
