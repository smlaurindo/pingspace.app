import { Injectable } from "@nestjs/common";
import { Transactional } from "@nestjs-cls/transactional";
import { TopicRepository } from "@/topics/repositories/topic.repository";
import { PingRepository } from "./repositories/ping.repository";
import { TopicNotFoundException } from "./exceptions/topic-not-found.exception";
import type { CreatePingRequest, CreatePingResponse } from "./types/pings.dto";
import { ApiKeyRepository } from "@/api-keys/repositories/api-key.repository";
import { ApiKeyNotFoundException } from "@/api-keys/exceptions/api-key-not-found.exception";

@Injectable()
export class PingsService {
  public constructor(
    private readonly apiKeyRepository: ApiKeyRepository,
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

    const apiKey = await this.apiKeyRepository.findById(apiKeyId);

    if (!apiKey) {
      throw new ApiKeyNotFoundException(apiKeyId);
    }

    const topic = await this.topicRepository.findBySpaceAndSlug(
      apiKey.spaceId,
      topicSlug,
    );

    if (!topic) {
      throw new TopicNotFoundException(topicSlug);
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
