import { Injectable } from "@nestjs/common";
import { TransactionalAdapterDrizzleORM } from "@/drizzle/drizzle.provider";
import { TransactionHost } from "@nestjs-cls/transactional";
import { PingRepository } from "../ping.repository";
import {
  CreatePingData,
  ListPingQuery,
  PaginatedPings,
  Ping,
  ReadByTopicData,
} from "../../types/pings.types";
import { pingActions, pingReads, pings, pingTags } from "../../pings.schema";
import { topicTags } from "../../../topics.schema";
import { and, desc, eq, inArray, isNull, lt } from "drizzle-orm";

@Injectable()
export class DrizzleORMPingRepository implements PingRepository {
  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterDrizzleORM>,
  ) {}

  async createPing(data: CreatePingData): Promise<Ping> {
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

  async listPings({
    topicId,
    cursor,
    limit,
  }: ListPingQuery): Promise<PaginatedPings> {
    const results = await this.txHost.tx
      .select({
        id: pings.id,
        title: pings.title,
        contentType: pings.contentType,
        content: pings.content,
        createdAt: pings.createdAt,
        updatedAt: pings.updatedAt,
      })
      .from(pings)
      .where(
        and(
          eq(pings.topicId, topicId),
          cursor ? lt(pings.createdAt, new Date(cursor)) : undefined,
        ),
      )
      .orderBy(desc(pings.createdAt))
      .limit(limit + 1);

    const hasMore = results.length > limit;

    const data = hasMore ? results.slice(0, limit) : results;

    const nextCursor =
      hasMore && data.length > 0
        ? data[data.length - 1].createdAt.toISOString()
        : null;

    if (data.length === 0) {
      return {
        items: [],
        pagination: { hasMore, nextCursor, limit },
      };
    }

    const pingIds = data.map((ping) => ping.id);

    const [actions, tags] = await Promise.all([
      this.txHost.tx
        .select({
          id: pingActions.id,
          type: pingActions.type,
          label: pingActions.label,
          url: pingActions.url,
          method: pingActions.method,
          headers: pingActions.headers,
          body: pingActions.body,
          pingId: pingActions.pingId,
        })
        .from(pingActions)
        .where(inArray(pingActions.pingId, pingIds)),
      this.txHost.tx
        .select({
          pingId: pingTags.pingId,
          id: topicTags.id,
          name: topicTags.name,
        })
        .from(pingTags)
        .innerJoin(topicTags, eq(pingTags.tagId, topicTags.id))
        .where(inArray(pingTags.pingId, pingIds)),
    ]);

    return {
      items: data.map((ping) => ({
        ...ping,
        actions: actions
          .filter((action) => action.pingId === ping.id)
          .map((action) => {
            switch (action.type) {
              case "LINK":
                return {
                  id: action.id,
                  type: "LINK" as const,
                  label: action.label,
                  url: action.url,
                };
              case "HTTP":
                return {
                  id: action.id,
                  type: "HTTP" as const,
                  label: action.label,
                  url: action.url,
                  method: action.method!,
                  headers: action.headers ?? undefined,
                  body: action.body ?? undefined,
                };
            }
          }),
        tags: tags
          .filter((tag) => tag.pingId === ping.id)
          .map(({ id, name }) => ({ id, name })),
      })),
      pagination: {
        hasMore,
        nextCursor,
        limit,
      },
    };
  }

  async readPings({
    topicId,
    spaceMemberId,
    timestamp,
  }: ReadByTopicData): Promise<void> {
    const unreadPings = await this.txHost.tx
      .select({
        pingId: pings.id,
      })
      .from(pings)
      .leftJoin(
        pingReads,
        and(
          eq(pingReads.pingId, pings.id),
          eq(pingReads.spaceMemberId, spaceMemberId),
        ),
      )
      .where(and(eq(pings.topicId, topicId), isNull(pingReads.id)));

    if (unreadPings.length === 0) {
      return;
    }

    const values = unreadPings.map(({ pingId }) => ({
      spaceMemberId,
      pingId,
      timestamp,
    }));

    await this.txHost.tx.insert(pingReads).values(values).onConflictDoNothing();
  }
}
