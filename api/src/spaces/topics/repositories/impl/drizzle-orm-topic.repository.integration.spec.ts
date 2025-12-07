import { TransactionalAdapterDrizzleORM } from "@/drizzle/drizzle.provider";
import { TransactionHost } from "@nestjs-cls/transactional";
import { describe, beforeEach, afterEach, it, expect } from "vitest";
import { DrizzleORMTopicRepository } from "./drizzle-orm-topic.repository";
import { getTestConfigService } from "@test/helpers/config.helper";
import {
  getTestTransactionHost,
  setupTestDatabase,
} from "@test/helpers/database.helper";
import {
  createTestSpace,
  createTestSpaceApiKey,
  createTestTopic,
  createTestUser,
  createTestPing,
  createTestSpaceMember,
} from "@test/helpers/factories.helper";
import * as schema from "@/drizzle/schema";

describe("DrizzleORMTopicRepository - Integration Tests", () => {
  let transactionHost: TransactionHost<TransactionalAdapterDrizzleORM>;
  let cleanupDatabase: () => Promise<void>;
  let sut: DrizzleORMTopicRepository;

  beforeEach(async () => {
    const configService = await getTestConfigService();
    const databaseURL = configService.get("database.url", { infer: true });

    const { db, cleanupFn } = await setupTestDatabase({
      connectionString: databaseURL,
    });

    cleanupDatabase = cleanupFn;
    transactionHost = await getTestTransactionHost(db);
    sut = new DrizzleORMTopicRepository(transactionHost);
  });

  afterEach(async () => {
    await cleanupDatabase();
  });

  describe("listTopicsBySpaceIdAndSpaceMemberId", () => {
    it("should return all topics in a space with zero unread count when no pings exist", async () => {
      const user = await createTestUser(transactionHost.tx);
      const { space, owner } = await createTestSpace(transactionHost.tx, {
        ownerId: user.id,
      });

      const topic1Overrides = { name: "Topic 1", slug: "topic-1" };
      const topic2Overrides = { name: "Topic 2", slug: "topic-2" };

      const [topic1, topic2] = await Promise.all([
        createTestTopic(
          transactionHost.tx,
          {
            spaceId: space.id,
          },
          topic1Overrides,
        ),
        createTestTopic(
          transactionHost.tx,
          {
            spaceId: space.id,
          },
          topic2Overrides,
        ),
      ]);

      const result = await sut.listTopicsBySpaceIdAndSpaceMemberId(
        space.id,
        owner.id,
      );

      expect(result).toHaveLength(2);

      const resultTopic1 = result.find((t) => t.id === topic1.id);
      const resultTopic2 = result.find((t) => t.id === topic2.id);

      expect(resultTopic1).toBeDefined();
      expect(resultTopic1!.id).toEqual(topic1.id);
      expect(resultTopic1!.name).toEqual(topic1Overrides.name);
      expect(resultTopic1!.slug).toEqual(topic1Overrides.slug);
      expect(resultTopic1!.unreadCount).toEqual(0);
      expect(resultTopic1!.lastPingAt).toBeNull();
      expect(resultTopic1!.isPinned).toEqual(false);

      expect(resultTopic2).toBeDefined();
      expect(resultTopic2!.id).toEqual(topic2.id);
      expect(resultTopic2!.name).toEqual(topic2Overrides.name);
      expect(resultTopic2!.slug).toEqual(topic2Overrides.slug);
      expect(resultTopic2!.unreadCount).toEqual(0);
      expect(resultTopic2!.lastPingAt).toBeNull();
      expect(resultTopic2!.isPinned).toEqual(false);
    });

    it("should return topics with correct unread ping counts", async () => {
      const user = await createTestUser(transactionHost.tx);
      const { space, owner } = await createTestSpace(transactionHost.tx, {
        ownerId: user.id,
      });

      const [topic1, topic2, apiKey] = await Promise.all([
        createTestTopic(
          transactionHost.tx,
          { spaceId: space.id },
          { name: "Topic 1" },
        ),
        createTestTopic(
          transactionHost.tx,
          { spaceId: space.id },
          { name: "Topic 2" },
        ),
        createTestSpaceApiKey(transactionHost.tx, {
          spaceId: space.id,
          spaceMemberId: owner.id,
        }),
      ]);

      await Promise.all([
        createTestPing(transactionHost.tx, {
          apiKeyId: apiKey.id,
          topicId: topic1.id,
          title: "Ping 1",
        }),
        createTestPing(transactionHost.tx, {
          apiKeyId: apiKey.id,
          topicId: topic1.id,
          title: "Ping 2",
        }),
        createTestPing(transactionHost.tx, {
          apiKeyId: apiKey.id,
          topicId: topic1.id,
          title: "Ping 3",
        }),
        createTestPing(transactionHost.tx, {
          apiKeyId: apiKey.id,
          topicId: topic2.id,
          title: "Ping 4",
        }),
        createTestPing(transactionHost.tx, {
          apiKeyId: apiKey.id,
          topicId: topic2.id,
          title: "Ping 5",
        }),
      ]);

      const result = await sut.listTopicsBySpaceIdAndSpaceMemberId(
        space.id,
        owner.id,
      );

      expect(result).toHaveLength(2);

      const resultTopic1 = result.find((t) => t.id === topic1.id);
      const resultTopic2 = result.find((t) => t.id === topic2.id);

      expect(resultTopic1).toBeDefined();
      expect(resultTopic1!.unreadCount).toEqual(3);

      expect(resultTopic2).toBeDefined();
      expect(resultTopic2!.unreadCount).toEqual(2);
    });

    it("should not count read pings in unread count", async () => {
      const user = await createTestUser(transactionHost.tx);
      const { space, owner } = await createTestSpace(transactionHost.tx, {
        ownerId: user.id,
      });

      const [topic, apiKey] = await Promise.all([
        createTestTopic(transactionHost.tx, {
          spaceId: space.id,
        }),
        createTestSpaceApiKey(transactionHost.tx, {
          spaceId: space.id,
          spaceMemberId: owner.id,
        }),
      ]);

      const [{ ping: ping1 }, { ping: ping2 }] = await Promise.all([
        createTestPing(transactionHost.tx, {
          apiKeyId: apiKey.id,
          topicId: topic.id,
          title: "Ping 1",
        }),
        createTestPing(transactionHost.tx, {
          apiKeyId: apiKey.id,
          topicId: topic.id,
          title: "Ping 2",
        }),
        createTestPing(transactionHost.tx, {
          apiKeyId: apiKey.id,
          topicId: topic.id,
          title: "Ping 3",
        }),
      ]);

      await transactionHost.tx.insert(schema.pingReads).values([
        {
          pingId: ping1.id,
          spaceMemberId: owner.id,
          timestamp: new Date("2025-12-06T10:00:00.000Z"),
        },
        {
          pingId: ping2.id,
          spaceMemberId: owner.id,
          timestamp: new Date("2025-12-06T10:01:00.000Z"),
        },
      ]);

      const result = await sut.listTopicsBySpaceIdAndSpaceMemberId(
        space.id,
        owner.id,
      );

      expect(result).toHaveLength(1);
      expect(result[0].id).toEqual(topic.id);
      expect(result[0].unreadCount).toEqual(1);
    });

    it("should return zero unread count when all pings are read", async () => {
      const user = await createTestUser(transactionHost.tx);
      const { space, owner } = await createTestSpace(transactionHost.tx, {
        ownerId: user.id,
      });

      const [topic, apiKey] = await Promise.all([
        createTestTopic(transactionHost.tx, {
          spaceId: space.id,
        }),
        createTestSpaceApiKey(transactionHost.tx, {
          spaceId: space.id,
          spaceMemberId: owner.id,
        }),
      ]);

      const [{ ping: ping1 }, { ping: ping2 }] = await Promise.all([
        createTestPing(transactionHost.tx, {
          apiKeyId: apiKey.id,
          topicId: topic.id,
          title: "Ping 1",
        }),
        createTestPing(transactionHost.tx, {
          apiKeyId: apiKey.id,
          topicId: topic.id,
          title: "Ping 2",
        }),
      ]);

      await transactionHost.tx.insert(schema.pingReads).values([
        {
          pingId: ping1.id,
          spaceMemberId: owner.id,
          timestamp: new Date("2025-12-06T10:00:00.000Z"),
        },
        {
          pingId: ping2.id,
          spaceMemberId: owner.id,
          timestamp: new Date("2025-12-06T10:01:00.000Z"),
        },
      ]);

      const result = await sut.listTopicsBySpaceIdAndSpaceMemberId(
        space.id,
        owner.id,
      );

      expect(result).toHaveLength(1);
      expect(result[0].id).toEqual(topic.id);
      expect(result[0].unreadCount).toEqual(0);
    });

    it("should return different unread counts for different space members", async () => {
      const [user1, user2] = await Promise.all([
        createTestUser(transactionHost.tx),
        createTestUser(transactionHost.tx),
      ]);

      const { space, owner } = await createTestSpace(transactionHost.tx, {
        ownerId: user1.id,
      });

      const member = await createTestSpaceMember(transactionHost.tx, {
        spaceId: space.id,
        memberId: user2.id,
      });

      const [topic, apiKey] = await Promise.all([
        createTestTopic(transactionHost.tx, {
          spaceId: space.id,
        }),
        createTestSpaceApiKey(transactionHost.tx, {
          spaceId: space.id,
          spaceMemberId: owner.id,
        }),
      ]);

      const [{ ping: ping1 }, { ping: ping2 }] = await Promise.all([
        createTestPing(transactionHost.tx, {
          apiKeyId: apiKey.id,
          topicId: topic.id,
          title: "Ping 1",
        }),
        createTestPing(transactionHost.tx, {
          apiKeyId: apiKey.id,
          topicId: topic.id,
          title: "Ping 2",
        }),
        createTestPing(transactionHost.tx, {
          apiKeyId: apiKey.id,
          topicId: topic.id,
          title: "Ping 3",
        }),
      ]);

      await transactionHost.tx.insert(schema.pingReads).values([
        {
          pingId: ping1.id,
          spaceMemberId: owner.id,
          timestamp: new Date("2025-12-06T10:00:00.000Z"),
        },
        {
          pingId: ping2.id,
          spaceMemberId: owner.id,
          timestamp: new Date("2025-12-06T10:01:00.000Z"),
        },
        {
          pingId: ping1.id,
          spaceMemberId: member.id,
          timestamp: new Date("2025-12-06T10:00:00.000Z"),
        },
      ]);

      const [resultOwner, resultMember] = await Promise.all([
        sut.listTopicsBySpaceIdAndSpaceMemberId(space.id, owner.id),
        sut.listTopicsBySpaceIdAndSpaceMemberId(space.id, member.id),
      ]);

      expect(resultOwner).toHaveLength(1);
      expect(resultOwner[0].unreadCount).toEqual(1);

      expect(resultMember).toHaveLength(1);
      expect(resultMember[0].unreadCount).toEqual(2);
    });

    it("should only return topics from the specified space", async () => {
      const user = await createTestUser(transactionHost.tx);

      const [{ space: space1, owner: owner1 }, { space: space2 }] =
        await Promise.all([
          createTestSpace(transactionHost.tx, {
            ownerId: user.id,
          }),
          createTestSpace(transactionHost.tx, {
            ownerId: user.id,
          }),
        ]);

      const topicSpace1Overrides = { name: "Topic in Space 1" };

      const [topicSpace1, topicSpace2] = await Promise.all([
        createTestTopic(
          transactionHost.tx,
          {
            spaceId: space1.id,
          },
          topicSpace1Overrides,
        ),
        createTestTopic(
          transactionHost.tx,
          {
            spaceId: space2.id,
          },
          {
            name: "Topic in Space 2",
          },
        ),
      ]);

      const result = await sut.listTopicsBySpaceIdAndSpaceMemberId(
        space1.id,
        owner1.id,
      );

      expect(result).toHaveLength(1);
      expect(result[0].id).toEqual(topicSpace1.id);
      expect(result[0].name).toEqual(topicSpace1Overrides.name);
      expect(result[0].unreadCount).toEqual(0);

      const topicIds = result.map((t) => t.id);
      expect(topicIds).not.toContain(topicSpace2.id);
    });

    it("should return empty array when space has no topics", async () => {
      const user = await createTestUser(transactionHost.tx);
      const { space, owner } = await createTestSpace(transactionHost.tx, {
        ownerId: user.id,
      });

      const result = await sut.listTopicsBySpaceIdAndSpaceMemberId(
        space.id,
        owner.id,
      );

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it("should return complete topic information including all fields", async () => {
      const user = await createTestUser(transactionHost.tx);
      const { space, owner } = await createTestSpace(transactionHost.tx, {
        ownerId: user.id,
      });

      const topicOverrides = {
        name: "Test Topic",
        slug: "test-topic",
        emoji: "🚀",
        shortDescription: "A short description",
      };

      const topic = await createTestTopic(
        transactionHost.tx,
        {
          spaceId: space.id,
        },
        topicOverrides,
      );

      const result = await sut.listTopicsBySpaceIdAndSpaceMemberId(
        space.id,
        owner.id,
      );

      expect(result).toHaveLength(1);

      const returnedTopic = result[0];
      expect(returnedTopic.id).toEqual(topic.id);
      expect(returnedTopic.name).toEqual(topicOverrides.name);
      expect(returnedTopic.slug).toEqual(topicOverrides.slug);
      expect(returnedTopic.emoji).toEqual(topicOverrides.emoji);
      expect(returnedTopic.shortDescription).toEqual(
        topicOverrides.shortDescription,
      );
      expect(returnedTopic.isPinned).toEqual(false);
      expect(returnedTopic.lastPingAt).toBeNull();
      expect(returnedTopic.unreadCount).toEqual(0);
    });

    it("should handle topics with tags and actions in pings correctly", async () => {
      const user = await createTestUser(transactionHost.tx);
      const { space, owner } = await createTestSpace(transactionHost.tx, {
        ownerId: user.id,
      });

      const [topic, apiKey] = await Promise.all([
        createTestTopic(transactionHost.tx, {
          spaceId: space.id,
        }),
        createTestSpaceApiKey(transactionHost.tx, {
          spaceId: space.id,
          spaceMemberId: owner.id,
        }),
      ]);

      await Promise.all([
        createTestPing(transactionHost.tx, {
          apiKeyId: apiKey.id,
          topicId: topic.id,
          title: "Complex Ping",
          tags: ["urgent", "bug"],
          actions: [
            {
              type: "HTTP",
              label: "Fix",
              url: "https://example.com/fix",
              method: "POST",
            },
            {
              type: "LINK",
              label: "View",
              url: "https://example.com/view",
            },
          ],
        }),
        createTestPing(transactionHost.tx, {
          apiKeyId: apiKey.id,
          topicId: topic.id,
          title: "Another Ping",
          tags: ["feature"],
        }),
      ]);

      const result = await sut.listTopicsBySpaceIdAndSpaceMemberId(
        space.id,
        owner.id,
      );

      expect(result).toHaveLength(1);
      expect(result[0].id).toEqual(topic.id);
      expect(result[0].unreadCount).toEqual(2);
    });

    it("should return lastPingAt with the timestamp of the most recent ping", async () => {
      const user = await createTestUser(transactionHost.tx);
      const { space, owner } = await createTestSpace(transactionHost.tx, {
        ownerId: user.id,
      });

      const [topic, apiKey] = await Promise.all([
        createTestTopic(transactionHost.tx, {
          spaceId: space.id,
        }),
        createTestSpaceApiKey(transactionHost.tx, {
          spaceId: space.id,
          spaceMemberId: owner.id,
        }),
      ]);

      const oldPingDate = new Date("2025-01-06T10:00:00.000Z");
      const recentPingDate = new Date("2025-01-07T15:30:00.000Z");

      await transactionHost.tx.insert(schema.pings).values([
        {
          apiKeyId: apiKey.id,
          topicId: topic.id,
          title: "Old Ping",
          contentType: "MARKDOWN",
          content: "Old content",
          createdAt: oldPingDate,
        },
        {
          apiKeyId: apiKey.id,
          topicId: topic.id,
          title: "Recent Ping",
          contentType: "MARKDOWN",
          content: "Recent content",
          createdAt: recentPingDate,
        },
      ]);

      const result = await sut.listTopicsBySpaceIdAndSpaceMemberId(
        space.id,
        owner.id,
      );

      expect(result).toHaveLength(1);
      expect(result[0].lastPingAt).toEqual(recentPingDate);
    });

    it("should order topics with pinned topics first, then by creation date", async () => {
      const user = await createTestUser(transactionHost.tx);
      const { space, owner } = await createTestSpace(transactionHost.tx, {
        ownerId: user.id,
      });

      const topic1 = await createTestTopic(
        transactionHost.tx,
        { spaceId: space.id },
        { name: "First Topic (unpinned)" },
      );

      const topic2 = await createTestTopic(
        transactionHost.tx,
        { spaceId: space.id },
        { name: "Second Topic (pinned)" },
      );

      const topic3 = await createTestTopic(
        transactionHost.tx,
        { spaceId: space.id },
        { name: "Third Topic (unpinned)" },
      );

      const topic4 = await createTestTopic(
        transactionHost.tx,
        { spaceId: space.id },
        { name: "Fourth Topic (pinned)" },
      );

      await sut.togglePinTopicById(topic2.id);
      await sut.togglePinTopicById(topic4.id);

      const result = await sut.listTopicsBySpaceIdAndSpaceMemberId(
        space.id,
        owner.id,
      );

      expect(result).toHaveLength(4);

      expect(result[0].id).toEqual(topic2.id);
      expect(result[0].isPinned).toEqual(true);

      expect(result[1].id).toEqual(topic4.id);
      expect(result[1].isPinned).toEqual(true);

      expect(result[2].id).toEqual(topic1.id);
      expect(result[2].isPinned).toEqual(false);

      expect(result[3].id).toEqual(topic3.id);
      expect(result[3].isPinned).toEqual(false);
    });

    it("should return null lastPingAt for topics with no pings", async () => {
      const user = await createTestUser(transactionHost.tx);
      const { space, owner } = await createTestSpace(transactionHost.tx, {
        ownerId: user.id,
      });

      const topicWithoutPings = await createTestTopic(transactionHost.tx, {
        spaceId: space.id,
      });

      const result = await sut.listTopicsBySpaceIdAndSpaceMemberId(
        space.id,
        owner.id,
      );

      expect(result).toHaveLength(1);
      expect(result[0].id).toEqual(topicWithoutPings.id);
      expect(result[0].lastPingAt).toBeNull();
      expect(result[0].unreadCount).toEqual(0);
    });

    it("should return different lastPingAt for different topics", async () => {
      const user = await createTestUser(transactionHost.tx);
      const { space, owner } = await createTestSpace(transactionHost.tx, {
        ownerId: user.id,
      });

      const [topic1, topic2, apiKey] = await Promise.all([
        createTestTopic(transactionHost.tx, { spaceId: space.id }),
        createTestTopic(transactionHost.tx, { spaceId: space.id }),
        createTestSpaceApiKey(transactionHost.tx, {
          spaceId: space.id,
          spaceMemberId: owner.id,
        }),
      ]);

      const topic1LastPing = new Date("2025-01-01T10:00:00.000Z");
      const topic2LastPing = new Date("2025-01-07T18:45:00.000Z");

      await transactionHost.tx.insert(schema.pings).values([
        {
          apiKeyId: apiKey.id,
          topicId: topic1.id,
          title: "Ping 1",
          contentType: "MARKDOWN",
          content: "Content",
          createdAt: new Date("2025-01-01T08:00:00.000Z"),
        },
        {
          apiKeyId: apiKey.id,
          topicId: topic1.id,
          title: "Ping 2",
          contentType: "MARKDOWN",
          content: "Content",
          createdAt: topic1LastPing,
        },
        {
          apiKeyId: apiKey.id,
          topicId: topic2.id,
          title: "Ping 3",
          contentType: "MARKDOWN",
          content: "Content",
          createdAt: topic2LastPing,
        },
      ]);

      const result = await sut.listTopicsBySpaceIdAndSpaceMemberId(
        space.id,
        owner.id,
      );

      expect(result).toHaveLength(2);

      const resultTopic1 = result.find((t) => t.id === topic1.id);
      const resultTopic2 = result.find((t) => t.id === topic2.id);

      expect(resultTopic1).toBeDefined();
      expect(resultTopic1!.lastPingAt).toEqual(topic1LastPing);

      expect(resultTopic2).toBeDefined();
      expect(resultTopic2!.lastPingAt).toEqual(topic2LastPing);
    });
  });
});
