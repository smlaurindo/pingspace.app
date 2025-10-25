import { Injectable } from "@nestjs/common";
import { Transactional } from "@nestjs-cls/transactional";
import type { CreateTopicRequest, CreateTopicResponse } from "./topics.dto";
import { TopicSlugAlreadyExistsException } from "./exceptions/topic-slug-already-exists.exception";
import { UnauthorizedSpaceAccessException } from "./exceptions/unauthorized-space-access.exception";
import type { SpaceMembershipInfo } from "@/spaces/spaces.types";
import { SPACE_ROLE_ADMIN, SPACE_ROLE_OWNER } from "@/spaces/spaces.schema";
import { TopicRepository } from "./repositories/topic.repository";
import { SpaceRepository } from "@/spaces/repositories/space.repository";
import { SpaceNotFoundException } from "./exceptions/space-not-found.exception";

@Injectable()
export class TopicsService {
  public constructor(
    private readonly spaceRepository: SpaceRepository,
    private readonly topicRepository: TopicRepository,
  ) {}

  @Transactional()
  async createTopic(
    request: CreateTopicRequest,
    membership: SpaceMembershipInfo,
  ): Promise<CreateTopicResponse> {
    const spaceExists = await this.spaceRepository.checkSpaceExists(
      request.spaceId,
    );

    if (!spaceExists) {
      throw new SpaceNotFoundException(request.spaceId);
    }

    const userHasPermission =
      membership.role === SPACE_ROLE_OWNER ||
      membership.role === SPACE_ROLE_ADMIN;

    if (!userHasPermission) {
      throw new UnauthorizedSpaceAccessException(membership.spaceId);
    }

    const { name, emoji, shortDescription, description, slug, spaceId } =
      request;

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
