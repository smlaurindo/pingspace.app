import { Injectable } from "@nestjs/common";
import { Transactional } from "@nestjs-cls/transactional";
import { SpaceApiKeyRepository } from "../../repositories/space-api-key.repository";
import { TopicRepository } from "../repositories/topic.repository";
import { PingRepository } from "./repositories/ping.repository";
import { SpaceApiKeyNotFoundException } from "../../exceptions/space-api-key-not-found.exception";
import { TopicSlugNotFoundException } from "../../exceptions/topic-slug-not-found.exception";
import type { CreatePingRequest, CreatePingResponse } from "./types/pings.dto";

@Injectable()
export class PingsService {
  public constructor(
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

    const apiKey = await this.spaceApiKeyRepository.findById(apiKeyId);

    if (!apiKey) {
      throw new SpaceApiKeyNotFoundException(apiKeyId);
    }

    const topic = await this.topicRepository.findBySpaceAndSlug(
      apiKey.spaceId,
      topicSlug,
    );

    if (!topic) {
      throw new TopicSlugNotFoundException(topicSlug);
    }

    const titleToUse = title ?? this.generateTitle(content, contentType);

    const newPing = await this.pingRepository.create({
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
}
