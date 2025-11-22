import { Injectable } from "@nestjs/common";
import { TransactionalAdapterDrizzleORM } from "@/drizzle/drizzle.provider";
import { TransactionHost } from "@nestjs-cls/transactional";
import { PingRepository } from "../ping.repository";
import { CreatePingData, Ping } from "../../types/pings.types";
import { pingActions, pings, pingTags } from "../../pings.schema";
import { and, eq } from "drizzle-orm";
import { topicTags } from "@/spaces/topics/topics.schema";

@Injectable()
export class DrizzleORMPingRepository implements PingRepository {
  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterDrizzleORM>,
  ) {}

  async create(data: CreatePingData): Promise<Ping> {
    const [ping] = await this.txHost.tx
      .insert(pings)
      .values({
        title: data.title,
        contentType: data.contentType,
        content: data.content,
        apiKeyId: data.apiKeyId,
        topicId: data.topicId,
      })
      .returning({
        id: pings.id,
        createdAt: pings.createdAt,
      });

    const actions = await Promise.all(
      data.actions.map(async (action) => {
        switch (action.type) {
          case "HTTP": {
            const [httpAction] = await this.txHost.tx
              .insert(pingActions)
              .values({
                type: action.type,
                label: action.label,
                url: action.url,
                method: action.method,
                headers: action.headers,
                body: action.body,
                pingId: ping.id,
              })
              .returning();

            return {
              id: httpAction.id,
              type: "HTTP" as const,
              label: httpAction.label,
              url: httpAction.url,
              method: httpAction.method!,
              headers: httpAction.headers ?? undefined,
              body: httpAction.body ?? undefined,
            };
          }
          case "LINK": {
            const [linkAction] = await this.txHost.tx
              .insert(pingActions)
              .values({
                type: action.type,
                label: action.label,
                url: action.url,
                pingId: ping.id,
              })
              .returning();

            return {
              id: linkAction.id,
              type: "LINK" as const,
              label: linkAction.label,
              url: linkAction.url,
            };
          }
        }
      }),
    );

    const tags = await Promise.all(
      data.tags.map(async (tagName) => {
        const [existingTag] = await this.txHost.tx
          .select({ id: topicTags.id, name: topicTags.name })
          .from(topicTags)
          .where(
            and(
              eq(topicTags.name, tagName),
              eq(topicTags.topicId, data.topicId),
            ),
          )
          .limit(1);

        let tagId: string;
        let name: string;

        if (existingTag) {
          tagId = existingTag.id;
          name = existingTag.name;
        } else {
          const [newTag] = await this.txHost.tx
            .insert(topicTags)
            .values({
              name: tagName,
              topicId: data.topicId,
            })
            .returning({
              id: topicTags.id,
              name: topicTags.name,
            });

          tagId = newTag.id;
          name = newTag.name;
        }

        await this.txHost.tx.insert(pingTags).values({
          pingId: ping.id,
          tagId,
        });

        return { id: tagId, name };
      }),
    );

    return {
      id: ping.id,
      title: data.title,
      content: data.content,
      contentType: data.contentType,
      topicId: data.topicId,
      actions,
      tags,
      createdAt: ping.createdAt,
      updatedAt: null,
    };
  }
}
