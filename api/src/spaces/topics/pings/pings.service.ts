import { Injectable } from "@nestjs/common";
import { Transactional } from "@nestjs-cls/transactional";
import { SpaceApiKeyRepository } from "../../repositories/space-api-key.repository";
import { TopicRepository } from "../repositories/topic.repository";
import { PingRepository } from "./repositories/ping.repository";
import { SpaceApiKeyNotFoundException } from "../../exceptions/space-api-key-not-found.exception";
import { TopicSlugNotFoundException } from "../../exceptions/topic-slug-not-found.exception";
import type {
  CreatePingRequest,
  CreatePingResponse,
  ListPingsRequest,
  ListPingsResponse,
  MarkPingsAsReadRequest,
} from "./types/pings.dto";
import { TransactionalAdapterDrizzleORM } from "@/drizzle/drizzle.provider";
import { SpaceRepository } from "../../repositories/space.repository";
import { SpaceMemberRepository } from "../../repositories/space-member.repository";
import { SpaceNotFoundException } from "../../exceptions/space-not-found.exception";
import { UnauthorizedSpaceAccessException } from "../../exceptions/unauthorized-space-access.exception";
import { TopicNotFoundException } from "../../exceptions/topic-not-found.exception";

@Injectable()
export class PingsService {
  public constructor(
    private readonly spaceRepository: SpaceRepository,
    private readonly spaceMemberRepository: SpaceMemberRepository,
    private readonly spaceApiKeyRepository: SpaceApiKeyRepository,
    private readonly topicRepository: TopicRepository,
    private readonly pingRepository: PingRepository,
  ) {}

  private extractMarkdownTitle(content: string): string | null {
    const match = content.match(/^#\s+(.+)$/m);
    return match ? match[1].trim() : null;
  }

  private generateTitle(
    content: string,
    contentType: CreatePingRequest["contentType"],
  ): string {
    if (contentType === "MARKDOWN") {
      const extractedTitle = this.extractMarkdownTitle(content);

      if (extractedTitle) {
        return extractedTitle;
      }
    }

    return `Ping at ${new Date().toISOString()}`;
  }

  @Transactional()
  async createPing(request: CreatePingRequest): Promise<CreatePingResponse> {
    const { apiKeyId, topicSlug, title, contentType, content, tags, actions } =
      request;

    const apiKey =
      await this.spaceApiKeyRepository.findSpaceApiKeyById(apiKeyId);

    if (!apiKey) {
      throw new SpaceApiKeyNotFoundException(apiKeyId);
    }

    const topic = await this.topicRepository.findTopicBySpaceIdAndSlug(
      apiKey.spaceId,
      topicSlug,
    );

    if (!topic) {
      throw new TopicSlugNotFoundException(topicSlug);
    }

    const titleToUse = title ?? this.generateTitle(content, contentType);

    const newPing = await this.pingRepository.createPing({
      title: titleToUse,
      contentType,
      content,
      actions: actions.map((action) => {
        if (action.type === "HTTP") {
          return {
            ...action,
            headers: action.headers
              ? JSON.stringify(action.headers)
              : undefined,
            body: action.body ? JSON.stringify(action.body) : undefined,
          };
        }
        return action;
      }),
      topicId: topic.id,
      apiKeyId,
      tags,
    });

    return {
      ...newPing,
      topic,
      spaceId: apiKey.spaceId,
    };
  }

  @Transactional<TransactionalAdapterDrizzleORM>({ accessMode: "read only" })
  async listPings(request: ListPingsRequest): Promise<ListPingsResponse> {
    const { spaceId, topicId, userId, cursor, limit } = request;

    const [spaceExists, spaceMember, topicExistsAndBelongsToSpace] =
      await Promise.all([
        this.spaceRepository.checkSpaceExistsById(spaceId),
        this.spaceMemberRepository.findSpaceMemberBySpaceIdAndMemberId(
          spaceId,
          userId,
        ),
        this.topicRepository.checkTopicExistsBySpaceIdAndId(spaceId, topicId),
      ]);

    if (!spaceExists) throw new SpaceNotFoundException(spaceId);

    if (!spaceMember) {
      throw new UnauthorizedSpaceAccessException(
        spaceId,
        "You must be a member of the space to list pings.",
      );
    }

    if (!topicExistsAndBelongsToSpace) {
      throw new TopicNotFoundException(topicId);
    }

    return await this.pingRepository.listPings({
      topicId,
      cursor,
      limit,
    });
  }

  @Transactional()
  async markPingsAsRead(request: MarkPingsAsReadRequest): Promise<void> {
    const { spaceId, topicId, userId, timestamp } = request;

    const [spaceExists, spaceMember, topicExistsAndBelongsToSpace] =
      await Promise.all([
        this.spaceRepository.checkSpaceExistsById(spaceId),
        this.spaceMemberRepository.findSpaceMemberBySpaceIdAndMemberId(
          spaceId,
          userId,
        ),
        this.topicRepository.checkTopicExistsBySpaceIdAndId(spaceId, topicId),
      ]);

    if (!spaceExists) throw new SpaceNotFoundException(spaceId);

    if (!spaceMember) {
      throw new UnauthorizedSpaceAccessException(
        spaceId,
        "You must be a member of the space to mark pings as read.",
      );
    }

    if (!topicExistsAndBelongsToSpace) {
      throw new TopicNotFoundException(topicId);
    }

    await this.pingRepository.readPings({
      topicId,
      spaceMemberId: spaceMember.id,
      timestamp,
    });
  }
}
