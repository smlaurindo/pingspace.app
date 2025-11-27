import { Injectable } from "@nestjs/common";
import { Transactional } from "@nestjs-cls/transactional";
import { TransactionalAdapterDrizzleORM } from "@/drizzle/drizzle.provider";
import { SpaceRepository } from "../repositories/space.repository";
import { SpaceNotFoundException } from "../exceptions/space-not-found.exception";
import { SpaceMembershipRepository } from "../repositories/space-membership.repository";
import { UnauthorizedSpaceAccessException } from "../exceptions/unauthorized-space-access.exception";
import { SPACE_ROLE_ADMIN, SPACE_ROLE_OWNER } from "../spaces.schema";
import { InsufficientSpacePermissionsException } from "../exceptions/insufficient-space-permissions.exception";
import { TopicSlugAlreadyExistsException } from "./exceptions/topic-slug-already-exists.exception";
import { TopicRepository } from "./repositories/topic.repository";
import type {
  CreateTopicRequest,
  CreateTopicResponse,
  DeleteTopicRequest,
  GetTopicRequest,
  GetTopicResponse,
} from "./types/topics.dto";
import { TopicNotFoundException } from "../exceptions/topic-not-found.exception";

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

  @Transactional<TransactionalAdapterDrizzleORM>({ accessMode: "read only" })
  async getTopic(request: GetTopicRequest): Promise<GetTopicResponse> {
    const { spaceId, topicId, userId } = request;

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
        "You must be a member of the space to view topics.",
      );
    }

    const topic = await this.topicRepository.findBySpaceAndId(spaceId, topicId);

    if (!topic) {
      throw new TopicNotFoundException(topicId);
    }

    return topic;
  }

  @Transactional()
  async deleteTopic(request: DeleteTopicRequest): Promise<void> {
    const { spaceId, topicId, userId } = request;

    const spaceExists = await this.spaceRepository.checkSpaceExists(spaceId);

    if (!spaceExists) {
      throw new SpaceNotFoundException(spaceId);
    }

    const spaceMembership =
      await this.spaceMembershipRepository.findBySpaceAndUser(spaceId, userId);

    if (!spaceMembership) {
      throw new UnauthorizedSpaceAccessException(
        spaceId,
        "You must be a member of the space to delete topics.",
      );
    }

    const isSpaceMembershipAllowedToDeleteTopics =
      spaceMembership.role === SPACE_ROLE_OWNER ||
      spaceMembership.role === SPACE_ROLE_ADMIN;

    if (!isSpaceMembershipAllowedToDeleteTopics) {
      throw new InsufficientSpacePermissionsException(
        spaceId,
        ["OWNER", "ADMIN"],
        "delete topics.",
      );
    }

    const topicExists = await this.topicRepository.existsBySpaceAndId(
      spaceId,
      topicId,
    );

    if (!topicExists) {
      throw new TopicNotFoundException(topicId);
    }

    await this.topicRepository.deleteById(topicId);
  }
}
