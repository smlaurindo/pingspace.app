import { TransactionalAdapterDrizzleORM } from "@/drizzle/drizzle.provider";
import { TransactionHost } from "@nestjs-cls/transactional";
import { describe, beforeEach, afterEach, it, expect } from "vitest";
import { DrizzleORMSpaceRepository } from "./drizzle-orm-space.repository";
import { getTestConfigService } from "@test/helpers/config.helper";
import {
  getTestTransactionHost,
  setupTestDatabase,
} from "@test/helpers/database.helper";
import {
  createTestSpace,
  createTestTopic,
  createTestUser,
  createTestPing,
  createTestSpaceApiKey,
} from "@test/helpers/factories.helper";
import * as schema from "@/drizzle/schema";

describe("DrizzleORMSpaceRepository - Integration Tests", () => {
  let transactionHost: TransactionHost<TransactionalAdapterDrizzleORM>;
  let cleanupDatabase: () => Promise<void>;
  let sut: DrizzleORMSpaceRepository;

  beforeEach(async () => {
    const configService = await getTestConfigService();
    const databaseURL = configService.get("database.url", { infer: true });

    const { db, cleanupFn } = await setupTestDatabase({
      connectionString: databaseURL,
    });

    cleanupDatabase = cleanupFn;
    transactionHost = await getTestTransactionHost(db);
    sut = new DrizzleORMSpaceRepository(transactionHost);
  });

  afterEach(async () => {
    await cleanupDatabase();
  });

  describe("listSpaces", () => {
    it("should return empty list when user has no spaces", async () => {
      const user = await createTestUser(transactionHost.tx);

      const result = await sut.listSpaces({
        memberId: user.id,
        limit: 10,
      });

      expect(result.items).toHaveLength(0);
      expect(result.pagination.hasNextPage).toBe(false);
      expect(result.pagination.nextCursor).toBeNull();
      expect(result.pagination.limit).toEqual(10);
    });

    it("should return spaces where user is a member", async () => {
      const [user, otherUser] = await Promise.all([
        createTestUser(transactionHost.tx),
        createTestUser(transactionHost.tx),
      ]);

      const [{ space }] = await Promise.all([
        createTestSpace(transactionHost.tx, {
          ownerId: user.id,
        }),
        createTestSpace(transactionHost.tx, {
          ownerId: otherUser.id,
        }),
      ]);

      const result = await sut.listSpaces({
        memberId: user.id,
        limit: 10,
      });

      expect(result.items).toHaveLength(1);
      expect(result.items[0].id).toEqual(space.id);
      expect(result.items[0].name).toEqual(space.name);
      expect(result.items[0].shortDescription).toEqual(space.shortDescription);
    });

    it("should include unread count for spaces with unread pings", async () => {
      const user = await createTestUser(transactionHost.tx);

      const { space, owner: spaceMember } = await createTestSpace(
        transactionHost.tx,
        {
          ownerId: user.id,
        },
      );

      const [topic, apiKey] = await Promise.all([
        createTestTopic(transactionHost.tx, {
          spaceId: space.id,
        }),
        createTestSpaceApiKey(transactionHost.tx, {
          spaceId: space.id,
          spaceMemberId: spaceMember.id,
        }),
      ]);

      await Promise.all([
        createTestPing(transactionHost.tx, {
          topicId: topic.id,
          apiKeyId: apiKey.id,
        }),
        createTestPing(transactionHost.tx, {
          topicId: topic.id,
          apiKeyId: apiKey.id,
        }),
        createTestPing(transactionHost.tx, {
          topicId: topic.id,
          apiKeyId: apiKey.id,
        }),
      ]);

      const result = await sut.listSpaces({
        memberId: user.id,
        limit: 10,
      });

      expect(result.items).toHaveLength(1);
      expect(result.items[0].unreadCount).toEqual(3);
    });

    it("should exclude read pings from unread count", async () => {
      const user = await createTestUser(transactionHost.tx);

      const { space, owner: spaceMember } = await createTestSpace(
        transactionHost.tx,
        {
          ownerId: user.id,
        },
      );

      const [topic, apiKey] = await Promise.all([
        createTestTopic(transactionHost.tx, {
          spaceId: space.id,
        }),
        createTestSpaceApiKey(transactionHost.tx, {
          spaceId: space.id,
          spaceMemberId: spaceMember.id,
        }),
      ]);

      const [, { ping: readPing }] = await Promise.all([
        createTestPing(transactionHost.tx, {
          topicId: topic.id,
          apiKeyId: apiKey.id,
        }),
        createTestPing(transactionHost.tx, {
          topicId: topic.id,
          apiKeyId: apiKey.id,
        }),
      ]);

      await transactionHost.tx.insert(schema.pingReads).values({
        pingId: readPing.id,
        spaceMemberId: spaceMember.id,
      });

      const result = await sut.listSpaces({
        memberId: user.id,
        limit: 10,
      });

      expect(result.items).toHaveLength(1);
      expect(result.items[0].unreadCount).toBe(1);
    });

    it("should return zero unread count for spaces without pings", async () => {
      const user = await createTestUser(transactionHost.tx);

      await createTestSpace(transactionHost.tx, {
        ownerId: user.id,
      });

      const result = await sut.listSpaces({
        memberId: user.id,
        limit: 10,
      });

      expect(result.items).toHaveLength(1);
      expect(result.items[0].unreadCount).toEqual(0);
      expect(result.items[0].lastPingAt).toBeNull();
    });

    it("should include lastPingAt from most recent ping", async () => {
      const user = await createTestUser(transactionHost.tx);

      const { space, owner: spaceMember } = await createTestSpace(
        transactionHost.tx,
        {
          ownerId: user.id,
        },
      );

      const [topic, apiKey] = await Promise.all([
        createTestTopic(transactionHost.tx, {
          spaceId: space.id,
        }),
        createTestSpaceApiKey(transactionHost.tx, {
          spaceId: space.id,
          spaceMemberId: spaceMember.id,
        }),
      ]);

      await createTestPing(transactionHost.tx, {
        topicId: topic.id,
        apiKeyId: apiKey.id,
      });

      await new Promise((resolve) => setTimeout(resolve, 10));

      const { ping: secondPing } = await createTestPing(transactionHost.tx, {
        topicId: topic.id,
        apiKeyId: apiKey.id,
      });

      const result = await sut.listSpaces({
        memberId: user.id,
        limit: 10,
      });

      expect(result.items).toHaveLength(1);
      expect(result.items[0].lastPingAt).not.toBeNull();
      expect(result.items[0].lastPingAt).toEqual(secondPing.createdAt);
    });

    it("should order pinned spaces before unpinned spaces", async () => {
      const user = await createTestUser(transactionHost.tx);

      const [{ space: pinnedSpace }, { space: unpinnedSpace }] =
        await Promise.all([
          createTestSpace(transactionHost.tx, {
            ownerId: user.id,
          }),
          createTestSpace(transactionHost.tx, {
            ownerId: user.id,
          }),
        ]);

      await transactionHost.tx.insert(schema.spacePins).values({
        spaceId: pinnedSpace.id,
        userId: user.id,
        pinned: true,
      });

      const result = await sut.listSpaces({
        memberId: user.id,
        limit: 10,
      });

      expect(result.items).toHaveLength(2);
      expect(result.items[0].id).toEqual(pinnedSpace.id);
      expect(result.items[0].isPinned).toBe(true);
      expect(result.items[1].id).toEqual(unpinnedSpace.id);
      expect(result.items[1].isPinned).toBe(false);
    });

    it("should order spaces by lastPingAt in descending order", async () => {
      const user = await createTestUser(transactionHost.tx);

      const [
        { space: space1, owner: spaceMember1 },
        { space: space2, owner: spaceMember2 },
      ] = await Promise.all([
        createTestSpace(transactionHost.tx, {
          ownerId: user.id,
        }),
        createTestSpace(transactionHost.tx, {
          ownerId: user.id,
        }),
      ]);

      const [topic1, apiKey1, topic2, apiKey2] = await Promise.all([
        createTestTopic(transactionHost.tx, {
          spaceId: space1.id,
        }),
        createTestSpaceApiKey(transactionHost.tx, {
          spaceId: space1.id,
          spaceMemberId: spaceMember1.id,
        }),
        createTestTopic(transactionHost.tx, {
          spaceId: space2.id,
        }),
        createTestSpaceApiKey(transactionHost.tx, {
          spaceId: space2.id,
          spaceMemberId: spaceMember2.id,
        }),
      ]);

      await createTestPing(transactionHost.tx, {
        topicId: topic1.id,
        apiKeyId: apiKey1.id,
      });

      await new Promise((resolve) => setTimeout(resolve, 10));

      await createTestPing(transactionHost.tx, {
        topicId: topic2.id,
        apiKeyId: apiKey2.id,
      });

      const result = await sut.listSpaces({
        memberId: user.id,
        limit: 10,
      });

      expect(result.items).toHaveLength(2);
      expect(result.items[0].id).toEqual(space2.id);
      expect(result.items[1].id).toEqual(space1.id);
    });

    it("should place spaces without pings at the end", async () => {
      const user = await createTestUser(transactionHost.tx);

      const [
        { space: spaceWithPing, owner: spaceMember },
        { space: spaceWithoutPing },
      ] = await Promise.all([
        createTestSpace(transactionHost.tx, {
          ownerId: user.id,
        }),
        createTestSpace(transactionHost.tx, {
          ownerId: user.id,
        }),
      ]);

      const [topic, apiKey] = await Promise.all([
        createTestTopic(transactionHost.tx, {
          spaceId: spaceWithPing.id,
        }),
        createTestSpaceApiKey(transactionHost.tx, {
          spaceId: spaceWithPing.id,
          spaceMemberId: spaceMember.id,
        }),
      ]);

      await createTestPing(transactionHost.tx, {
        topicId: topic.id,
        apiKeyId: apiKey.id,
      });

      const result = await sut.listSpaces({
        memberId: user.id,
        limit: 10,
      });

      expect(result.items).toHaveLength(2);
      expect(result.items[0].id).toEqual(spaceWithPing.id);
      expect(result.items[1].id).toEqual(spaceWithoutPing.id);
    });

    it("should respect limit parameter", async () => {
      const user = await createTestUser(transactionHost.tx);

      await Promise.all(
        Array.from({ length: 5 }).map(() =>
          createTestSpace(transactionHost.tx, {
            ownerId: user.id,
          }),
        ),
      );

      const result = await sut.listSpaces({
        memberId: user.id,
        limit: 3,
      });

      expect(result.items).toHaveLength(3);
      expect(result.pagination.limit).toEqual(3);
    });

    it("should return hasNextPage true when more items exist", async () => {
      const user = await createTestUser(transactionHost.tx);

      await Promise.all(
        Array.from({ length: 5 }).map(() =>
          createTestSpace(transactionHost.tx, {
            ownerId: user.id,
          }),
        ),
      );

      const result = await sut.listSpaces({
        memberId: user.id,
        limit: 3,
      });

      expect(result.items).toHaveLength(3);
      expect(result.pagination.hasNextPage).toBe(true);
      expect(result.pagination.nextCursor).toBeDefined();
    });

    it("should return hasNextPage false when no more items exist", async () => {
      const user = await createTestUser(transactionHost.tx);

      await Promise.all(
        Array.from({ length: 3 }).map(() =>
          createTestSpace(transactionHost.tx, {
            ownerId: user.id,
          }),
        ),
      );

      const result = await sut.listSpaces({
        memberId: user.id,
        limit: 5,
      });

      expect(result.items).toHaveLength(3);
      expect(result.pagination.hasNextPage).toBe(false);
      expect(result.pagination.nextCursor).toBeNull();
    });

    it("should support cursor-based pagination", async () => {
      const user = await createTestUser(transactionHost.tx);

      await Promise.all(
        Array.from({ length: 10 }).map(() =>
          createTestSpace(transactionHost.tx, {
            ownerId: user.id,
          }),
        ),
      );

      const firstPage = await sut.listSpaces({
        memberId: user.id,
        limit: 4,
      });

      expect(firstPage.items).toHaveLength(4);
      expect(firstPage.pagination.hasNextPage).toBe(true);

      const secondPage = await sut.listSpaces({
        memberId: user.id,
        limit: 4,
        cursor: firstPage.pagination.nextCursor!,
      });

      expect(secondPage.items).toHaveLength(4);
      expect(secondPage.pagination.hasNextPage).toBe(true);

      const firstPageIds = firstPage.items.map((item) => item.id);
      const secondPageIds = secondPage.items.map((item) => item.id);
      const hasOverlap = firstPageIds.some((id) => secondPageIds.includes(id));
      expect(hasOverlap).toBe(false);
    });
  });
});
