import { describe, beforeEach, afterEach, it, expect } from "vitest";
import { TransactionHost } from "@nestjs-cls/transactional";
import { type TransactionalAdapterDrizzleORM } from "@/drizzle/drizzle.provider";
import { getTestConfigService } from "@test/helpers/config.helper";
import {
  setupTestDatabase,
  getTestTransactionHost,
} from "@test/helpers/database.helper";
import { DrizzleORMPingRepository } from "./drizzle-orm-ping.repository";
import {
  createTestSpace,
  createTestSpaceApiKey,
  createTestTopic,
  createTestUser,
  createTestPing,
  createTestSpaceMember,
} from "@test/helpers/factories.helper";
import * as schema from "@/drizzle/schema";
import { eq } from "drizzle-orm";

describe("DrizzleORMPingRepository - Integration Tests", () => {
  let transactionHost: TransactionHost<TransactionalAdapterDrizzleORM>;
  let cleanupDatabase: () => Promise<void>;
  let sut: DrizzleORMPingRepository;

  beforeEach(async () => {
    const configService = await getTestConfigService();
    const databaseURL = configService.get("database.url", { infer: true });

    const { db, cleanupFn } = await setupTestDatabase({
      connectionString: databaseURL,
    });

    cleanupDatabase = cleanupFn;
    transactionHost = await getTestTransactionHost(db);
    sut = new DrizzleORMPingRepository(transactionHost);
  });

  afterEach(async () => {
    await cleanupDatabase();
  });

  describe("createPing", () => {
    it("should create a new ping record with tags in the database", async () => {
      const user = await createTestUser(transactionHost.tx);
      const { space, owner } = await createTestSpace(transactionHost.tx, {
        ownerId: user.id,
      });
      const topic = await createTestTopic(transactionHost.tx, {
        spaceId: space.id,
      });
      const apiKey = await createTestSpaceApiKey(transactionHost.tx, {
        spaceId: space.id,
        spaceMemberId: owner.id,
      });

      const pingData = {
        apiKeyId: apiKey.id,
        topicId: topic.id,
        content: '{ "message": "Hello, World!" }',
        contentType: "JSON" as const,
        title: "Test Ping",
        actions: [],
        tags: ["tag1", "tag2"],
      };

      const result = await sut.createPing(pingData);

      expect(result).toBeDefined();
      expect(result.id).toEqual(expect.any(String));
      expect(result.title).toBe("Test Ping");
      expect(result.content).toBe('{ "message": "Hello, World!" }');
      expect(result.contentType).toBe("JSON");
      expect(result.topicId).toBe(topic.id);
      expect(result.actions).toEqual([]);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeNull();

      expect(result.tags).toHaveLength(2);
      expect(result.tags[0]).toEqual({
        id: expect.any(String),
        name: expect.stringMatching(/^tag[12]$/),
      });
      expect(result.tags[1]).toEqual({
        id: expect.any(String),
        name: expect.stringMatching(/^tag[12]$/),
      });

      const tagNames = result.tags.map((t) => t.name).sort();
      expect(tagNames).toEqual(["tag1", "tag2"]);

      const [persistedPing] = await transactionHost.tx
        .select()
        .from(schema.pings)
        .where(eq(schema.pings.id, result.id));

      expect(persistedPing).toBeDefined();
      expect(persistedPing.id).toBe(result.id);
      expect(persistedPing.title).toBe("Test Ping");
      expect(persistedPing.content).toBe('{ "message": "Hello, World!" }');
      expect(persistedPing.contentType).toBe("JSON");
      expect(persistedPing.apiKeyId).toBe(apiKey.id);
      expect(persistedPing.topicId).toBe(topic.id);
      expect(persistedPing.createdAt).toBeInstanceOf(Date);
      expect(persistedPing.updatedAt).toBeNull();

      const persistedTopicTags = await transactionHost.tx
        .select()
        .from(schema.topicTags)
        .where(eq(schema.topicTags.topicId, topic.id));

      expect(persistedTopicTags).toHaveLength(2);

      const persistedTag1 = persistedTopicTags.find((t) => t.name === "tag1");
      const persistedTag2 = persistedTopicTags.find((t) => t.name === "tag2");

      expect(persistedTag1).toBeDefined();
      expect(persistedTag1!.id).toEqual(expect.any(String));
      expect(persistedTag1!.name).toBe("tag1");
      expect(persistedTag1!.topicId).toBe(topic.id);

      expect(persistedTag2).toBeDefined();
      expect(persistedTag2!.id).toEqual(expect.any(String));
      expect(persistedTag2!.name).toBe("tag2");
      expect(persistedTag2!.topicId).toBe(topic.id);

      const persistedPingTags = await transactionHost.tx
        .select()
        .from(schema.pingTags)
        .where(eq(schema.pingTags.pingId, result.id));

      expect(persistedPingTags).toHaveLength(2);

      const resultTagIds = result.tags.map((t) => t.id).sort();
      const persistedTagIds = persistedPingTags.map((pt) => pt.tagId).sort();

      expect(persistedTagIds).toEqual(resultTagIds);

      persistedPingTags.forEach((pingTagRecord) => {
        expect(pingTagRecord.pingId).toBe(result.id);
        expect(resultTagIds).toContain(pingTagRecord.tagId);
      });
    });

    it("should create ping with HTTP actions including headers and body", async () => {
      const user = await createTestUser(transactionHost.tx);
      const { space, owner } = await createTestSpace(transactionHost.tx, {
        ownerId: user.id,
      });
      const topic = await createTestTopic(transactionHost.tx, {
        spaceId: space.id,
      });
      const apiKey = await createTestSpaceApiKey(transactionHost.tx, {
        spaceId: space.id,
        spaceMemberId: owner.id,
      });

      const pingData = {
        apiKeyId: apiKey.id,
        topicId: topic.id,
        content: "Test content",
        contentType: "MARKDOWN" as const,
        title: "Ping with HTTP action",
        actions: [
          {
            type: "HTTP" as const,
            label: "Call Webhook",
            url: "https://api.example.com/webhook",
            method: "POST" as const,
            headers: '{"Content-Type": "application/json"}',
            body: '{"event": "ping"}',
          },
        ],
        tags: [],
      };

      const result = await sut.createPing(pingData);

      expect(result.actions).toHaveLength(1);
      expect(result.actions[0]).toEqual({
        id: expect.any(String),
        type: "HTTP",
        label: "Call Webhook",
        url: "https://api.example.com/webhook",
        method: "POST",
        headers: '{"Content-Type": "application/json"}',
        body: '{"event": "ping"}',
      });

      const persistedActions = await transactionHost.tx
        .select()
        .from(schema.pingActions)
        .where(eq(schema.pingActions.pingId, result.id));

      expect(persistedActions).toHaveLength(1);

      const [persistedAction] = persistedActions;
      expect(persistedAction.id).toBe(result.actions[0].id);
      expect(persistedAction.type).toBe("HTTP");
      expect(persistedAction.label).toBe("Call Webhook");
      expect(persistedAction.url).toBe("https://api.example.com/webhook");
      expect(persistedAction.method).toBe("POST");
      expect(persistedAction.headers).toBe(
        '{"Content-Type": "application/json"}',
      );
      expect(persistedAction.body).toBe('{"event": "ping"}');
      expect(persistedAction.pingId).toBe(result.id);
    });

    it("should create ping with LINK actions", async () => {
      const user = await createTestUser(transactionHost.tx);
      const { space, owner } = await createTestSpace(transactionHost.tx, {
        ownerId: user.id,
      });
      const topic = await createTestTopic(transactionHost.tx, {
        spaceId: space.id,
      });
      const apiKey = await createTestSpaceApiKey(transactionHost.tx, {
        spaceId: space.id,
        spaceMemberId: owner.id,
      });

      const pingData = {
        apiKeyId: apiKey.id,
        topicId: topic.id,
        content: "Check this out",
        contentType: "MARKDOWN" as const,
        title: "Ping with link",
        actions: [
          {
            type: "LINK" as const,
            label: "View Details",
            url: "https://example.com/details",
          },
        ],
        tags: [],
      };

      const result = await sut.createPing(pingData);

      expect(result.actions).toHaveLength(1);
      expect(result.actions[0]).toEqual({
        id: expect.any(String),
        type: "LINK",
        label: "View Details",
        url: "https://example.com/details",
      });

      const persistedActions = await transactionHost.tx
        .select()
        .from(schema.pingActions)
        .where(eq(schema.pingActions.pingId, result.id));

      expect(persistedActions).toHaveLength(1);

      const [persistedAction] = persistedActions;
      expect(persistedAction.id).toBe(result.actions[0].id);
      expect(persistedAction.type).toBe("LINK");
      expect(persistedAction.label).toBe("View Details");
      expect(persistedAction.url).toBe("https://example.com/details");
      expect(persistedAction.pingId).toBe(result.id);
      expect(persistedAction.method).toBeNull();
      expect(persistedAction.headers).toBeNull();
      expect(persistedAction.body).toBeNull();
    });

    it("should create ping with multiple mixed actions in correct order", async () => {
      const user = await createTestUser(transactionHost.tx);
      const { space, owner } = await createTestSpace(transactionHost.tx, {
        ownerId: user.id,
      });
      const topic = await createTestTopic(transactionHost.tx, {
        spaceId: space.id,
      });
      const apiKey = await createTestSpaceApiKey(transactionHost.tx, {
        spaceId: space.id,
        spaceMemberId: owner.id,
      });

      const pingData = {
        apiKeyId: apiKey.id,
        topicId: topic.id,
        content: "Multiple actions",
        contentType: "MARKDOWN" as const,
        title: "Ping with mixed actions",
        actions: [
          {
            type: "HTTP" as const,
            label: "Approve",
            url: "https://api.example.com/approve",
            method: "POST" as const,
          },
          {
            type: "LINK" as const,
            label: "View More",
            url: "https://example.com/more",
          },
          {
            type: "HTTP" as const,
            label: "Reject",
            url: "https://api.example.com/reject",
            method: "DELETE" as const,
          },
        ],
        tags: [],
      };

      const result = await sut.createPing(pingData);

      expect(result.actions).toHaveLength(3);

      expect(result.actions[0]).toEqual({
        id: expect.any(String),
        type: "HTTP",
        label: "Approve",
        url: "https://api.example.com/approve",
        method: "POST",
      });

      expect(result.actions[1]).toEqual({
        id: expect.any(String),
        type: "LINK",
        label: "View More",
        url: "https://example.com/more",
      });

      expect(result.actions[2]).toEqual({
        id: expect.any(String),
        type: "HTTP",
        label: "Reject",
        url: "https://api.example.com/reject",
        method: "DELETE",
      });

      const persistedActions = await transactionHost.tx
        .select()
        .from(schema.pingActions)
        .where(eq(schema.pingActions.pingId, result.id));

      expect(persistedActions).toHaveLength(3);

      const actionIds = result.actions.map((a) => a.id);
      persistedActions.forEach((action) => {
        expect(actionIds).toContain(action.id);
        expect(action.pingId).toBe(result.id);
      });

      const httpActions = persistedActions.filter((a) => a.type === "HTTP");
      const linkActions = persistedActions.filter((a) => a.type === "LINK");

      expect(httpActions).toHaveLength(2);
      expect(linkActions).toHaveLength(1);
    });

    it("should reuse existing tags when creating ping", async () => {
      const user = await createTestUser(transactionHost.tx);
      const { space, owner } = await createTestSpace(transactionHost.tx, {
        ownerId: user.id,
      });
      const topic = await createTestTopic(transactionHost.tx, {
        spaceId: space.id,
      });
      const apiKey = await createTestSpaceApiKey(transactionHost.tx, {
        spaceId: space.id,
        spaceMemberId: owner.id,
      });

      const firstPingData = {
        apiKeyId: apiKey.id,
        topicId: topic.id,
        content: "First ping",
        contentType: "MARKDOWN" as const,
        title: "First",
        actions: [],
        tags: ["urgent", "bug"],
      };

      const secondPingData = {
        apiKeyId: apiKey.id,
        topicId: topic.id,
        content: "Second ping",
        contentType: "MARKDOWN" as const,
        title: "Second",
        actions: [],
        tags: ["urgent", "feature"],
      };

      const firstPing = await sut.createPing(firstPingData);

      const tagsAfterFirstPing = await transactionHost.tx
        .select()
        .from(schema.topicTags)
        .where(eq(schema.topicTags.topicId, topic.id));

      const secondPing = await sut.createPing(secondPingData);

      const tagsAfterSecondPing = await transactionHost.tx
        .select()
        .from(schema.topicTags)
        .where(eq(schema.topicTags.topicId, topic.id));

      expect(tagsAfterFirstPing).toHaveLength(2);
      expect(firstPing.tags).toHaveLength(2);

      const firstPingTagNames = firstPing.tags.map((t) => t.name).sort();
      expect(firstPingTagNames).toEqual(["bug", "urgent"]);

      expect(tagsAfterSecondPing).toHaveLength(3);
      expect(secondPing.tags).toHaveLength(2);

      const secondPingTagNames = secondPing.tags.map((t) => t.name).sort();
      expect(secondPingTagNames).toEqual(["feature", "urgent"]);

      const urgentTagFromFirstPing = firstPing.tags.find(
        (t) => t.name === "urgent",
      );
      const urgentTagFromSecondPing = secondPing.tags.find(
        (t) => t.name === "urgent",
      );

      expect(urgentTagFromFirstPing).toBeDefined();
      expect(urgentTagFromSecondPing).toBeDefined();
      expect(urgentTagFromFirstPing!.id).toBe(urgentTagFromSecondPing!.id);

      const bugTag = firstPing.tags.find((t) => t.name === "bug");
      const featureTag = secondPing.tags.find((t) => t.name === "feature");

      expect(bugTag).toBeDefined();
      expect(featureTag).toBeDefined();
      expect(bugTag!.id).not.toBe(featureTag!.id);
      expect(bugTag!.id).not.toBe(urgentTagFromFirstPing!.id);
      expect(featureTag!.id).not.toBe(urgentTagFromFirstPing!.id);

      tagsAfterSecondPing.forEach((tag) => {
        expect(tag.topicId).toBe(topic.id);
      });
    });

    it("should create ping with MARKDOWN content type", async () => {
      const user = await createTestUser(transactionHost.tx);
      const { space, owner } = await createTestSpace(transactionHost.tx, {
        ownerId: user.id,
      });
      const topic = await createTestTopic(transactionHost.tx, {
        spaceId: space.id,
      });
      const apiKey = await createTestSpaceApiKey(transactionHost.tx, {
        spaceId: space.id,
        spaceMemberId: owner.id,
      });

      const markdownContent = "# Hello\n\nThis is **markdown**";
      const pingData = {
        apiKeyId: apiKey.id,
        topicId: topic.id,
        content: markdownContent,
        contentType: "MARKDOWN" as const,
        title: "Markdown Ping",
        actions: [],
        tags: [],
      };

      const result = await sut.createPing(pingData);

      expect(result.contentType).toBe("MARKDOWN");
      expect(result.content).toBe(markdownContent);
      expect(result.title).toBe("Markdown Ping");
      expect(result.actions).toEqual([]);
      expect(result.tags).toEqual([]);

      const [persistedPing] = await transactionHost.tx
        .select()
        .from(schema.pings)
        .where(eq(schema.pings.id, result.id));

      expect(persistedPing).toBeDefined();
      expect(persistedPing.contentType).toBe("MARKDOWN");
      expect(persistedPing.content).toBe(markdownContent);
      expect(persistedPing.title).toBe("Markdown Ping");
      expect(persistedPing.topicId).toBe(topic.id);
      expect(persistedPing.apiKeyId).toBe(apiKey.id);
    });

    it("should create ping tags associations correctly", async () => {
      const user = await createTestUser(transactionHost.tx);
      const { space, owner } = await createTestSpace(transactionHost.tx, {
        ownerId: user.id,
      });
      const topic = await createTestTopic(transactionHost.tx, {
        spaceId: space.id,
      });
      const apiKey = await createTestSpaceApiKey(transactionHost.tx, {
        spaceId: space.id,
        spaceMemberId: owner.id,
      });

      const pingData = {
        apiKeyId: apiKey.id,
        topicId: topic.id,
        content: "Tagged ping",
        contentType: "JSON" as const,
        title: "Test",
        actions: [],
        tags: ["tag1", "tag2", "tag3"],
      };

      const result = await sut.createPing(pingData);

      expect(result.tags).toHaveLength(3);

      const resultTagNames = result.tags.map((t) => t.name).sort();
      expect(resultTagNames).toEqual(["tag1", "tag2", "tag3"]);

      result.tags.forEach((tag) => {
        expect(tag.id).toEqual(expect.any(String));
        expect(tag.name).toMatch(/^tag[123]$/);
      });

      const persistedPingTags = await transactionHost.tx
        .select()
        .from(schema.pingTags)
        .where(eq(schema.pingTags.pingId, result.id));

      expect(persistedPingTags).toHaveLength(3);

      const resultTagIds = result.tags.map((t) => t.id).sort();
      const persistedTagIds = persistedPingTags.map((pt) => pt.tagId).sort();

      expect(persistedTagIds).toEqual(resultTagIds);

      persistedPingTags.forEach((pingTagRecord) => {
        expect(pingTagRecord.pingId).toBe(result.id);
        expect(resultTagIds).toContain(pingTagRecord.tagId);
      });

      const persistedTopicTags = await transactionHost.tx
        .select()
        .from(schema.topicTags)
        .where(eq(schema.topicTags.topicId, topic.id));

      expect(persistedTopicTags).toHaveLength(3);

      persistedTopicTags.forEach((topicTag) => {
        expect(topicTag.topicId).toBe(topic.id);
        expect(resultTagIds).toContain(topicTag.id);
        expect(["tag1", "tag2", "tag3"]).toContain(topicTag.name);
      });
    });
  });

  describe("readPings", () => {
    it("should mark unread pings as read for a space member", async () => {
      const user = await createTestUser(transactionHost.tx);

      const { space, owner } = await createTestSpace(transactionHost.tx, {
        ownerId: user.id,
      });

      const topic = await createTestTopic(transactionHost.tx, {
        spaceId: space.id,
      });

      const apiKey = await createTestSpaceApiKey(transactionHost.tx, {
        spaceId: space.id,
        spaceMemberId: owner.id,
      });

      const { ping: ping1 } = await createTestPing(transactionHost.tx, {
        apiKeyId: apiKey.id,
        topicId: topic.id,
        title: "Ping 1",
        content: "First ping",
        contentType: "MARKDOWN",
      });

      const { ping: ping2 } = await createTestPing(transactionHost.tx, {
        apiKeyId: apiKey.id,
        topicId: topic.id,
        title: "Ping 2",
        content: "Second ping",
        contentType: "MARKDOWN",
      });

      const { ping: ping3 } = await createTestPing(transactionHost.tx, {
        apiKeyId: apiKey.id,
        topicId: topic.id,
        title: "Ping 3",
        content: "Third ping",
        contentType: "MARKDOWN",
      });

      const timestamp = new Date("2025-12-06T10:30:45.000Z");

      const readsBeforeAction = await transactionHost.tx
        .select()
        .from(schema.pingReads)
        .where(eq(schema.pingReads.spaceMemberId, owner.id));

      expect(readsBeforeAction).toHaveLength(0);

      await sut.readPings({
        topicId: topic.id,
        spaceMemberId: owner.id,
        timestamp,
      });

      const persistedPingReads = await transactionHost.tx
        .select()
        .from(schema.pingReads)
        .where(eq(schema.pingReads.spaceMemberId, owner.id));

      expect(persistedPingReads).toHaveLength(3);

      const pingIds = [ping1.id, ping2.id, ping3.id];
      persistedPingReads.forEach((read) => {
        expect(read.spaceMemberId).toBe(owner.id);
        expect(pingIds).toContain(read.pingId);
        expect(read.timestamp).toEqual(timestamp);
        expect(read.createdAt).toBeInstanceOf(Date);
      });

      const readPingIds = persistedPingReads.map((r) => r.pingId).sort();
      expect(readPingIds).toEqual([ping1.id, ping2.id, ping3.id].sort());
    });

    it("should not create duplicate read records when called multiple times", async () => {
      const user = await createTestUser(transactionHost.tx);
      const { space, owner } = await createTestSpace(transactionHost.tx, {
        ownerId: user.id,
      });
      const topic = await createTestTopic(transactionHost.tx, {
        spaceId: space.id,
      });
      const apiKey = await createTestSpaceApiKey(transactionHost.tx, {
        spaceId: space.id,
        spaceMemberId: owner.id,
      });

      await createTestPing(transactionHost.tx, {
        apiKeyId: apiKey.id,
        topicId: topic.id,
        title: "Test",
        content: "Test ping",
        contentType: "MARKDOWN",
      });

      const firstTimestamp = new Date("2025-12-06T10:30:45.000Z");
      const secondTimestamp = new Date("2025-12-06T10:31:00.000Z");

      await sut.readPings({
        topicId: topic.id,
        spaceMemberId: owner.id,
        timestamp: firstTimestamp,
      });

      const readsAfterFirst = await transactionHost.tx
        .select()
        .from(schema.pingReads)
        .where(eq(schema.pingReads.spaceMemberId, owner.id));

      await sut.readPings({
        topicId: topic.id,
        spaceMemberId: owner.id,
        timestamp: secondTimestamp,
      });

      const readsAfterSecond = await transactionHost.tx
        .select()
        .from(schema.pingReads)
        .where(eq(schema.pingReads.spaceMemberId, owner.id));

      expect(readsAfterFirst).toHaveLength(1);
      expect(readsAfterSecond).toHaveLength(1);

      expect(readsAfterFirst[0].id).toBe(readsAfterSecond[0].id);
      expect(readsAfterFirst[0].timestamp).toEqual(firstTimestamp);
      expect(readsAfterSecond[0].timestamp).toEqual(firstTimestamp);
    });

    it("should do nothing when there are no unread pings", async () => {
      const user = await createTestUser(transactionHost.tx);
      const { space, owner } = await createTestSpace(transactionHost.tx, {
        ownerId: user.id,
      });
      const topic = await createTestTopic(transactionHost.tx, {
        spaceId: space.id,
      });

      const timestamp = new Date("2025-12-06T10:30:00.000Z");

      await sut.readPings({
        topicId: topic.id,
        spaceMemberId: owner.id,
        timestamp,
      });

      const persistedPingReads = await transactionHost.tx
        .select()
        .from(schema.pingReads)
        .where(eq(schema.pingReads.spaceMemberId, owner.id));

      expect(persistedPingReads).toHaveLength(0);
    });

    it("should only mark unread pings for specific topic", async () => {
      const user = await createTestUser(transactionHost.tx);
      const { space, owner } = await createTestSpace(transactionHost.tx, {
        ownerId: user.id,
      });

      const topic1 = await createTestTopic(transactionHost.tx, {
        spaceId: space.id,
      });

      const topic2 = await createTestTopic(transactionHost.tx, {
        spaceId: space.id,
      });

      const apiKey = await createTestSpaceApiKey(transactionHost.tx, {
        spaceId: space.id,
        spaceMemberId: owner.id,
      });

      const { ping: pingTopic1 } = await createTestPing(transactionHost.tx, {
        apiKeyId: apiKey.id,
        topicId: topic1.id,
        title: "Topic 1 Ping",
        content: "Ping in topic 1",
        contentType: "MARKDOWN",
      });

      const { ping: pingTopic2 } = await createTestPing(transactionHost.tx, {
        apiKeyId: apiKey.id,
        topicId: topic2.id,
        title: "Topic 2 Ping",
        content: "Ping in topic 2",
        contentType: "MARKDOWN",
      });

      const timestamp = new Date("2025-12-06T10:30:00.000Z");

      await sut.readPings({
        topicId: topic1.id,
        spaceMemberId: owner.id,
        timestamp,
      });

      const persistedPingReads = await transactionHost.tx
        .select()
        .from(schema.pingReads)
        .where(eq(schema.pingReads.spaceMemberId, owner.id));

      expect(persistedPingReads).toHaveLength(1);
      expect(persistedPingReads[0].pingId).toBe(pingTopic1.id);
      expect(persistedPingReads[0].pingId).not.toBe(pingTopic2.id);

      const topic2PingReads = await transactionHost.tx
        .select()
        .from(schema.pingReads)
        .where(eq(schema.pingReads.pingId, pingTopic2.id));

      expect(topic2PingReads).toHaveLength(0);
    });

    it("should only mark pings as read for specific space member", async () => {
      const user1 = await createTestUser(transactionHost.tx);

      const { space, owner } = await createTestSpace(transactionHost.tx, {
        ownerId: user1.id,
      });

      const user2 = await createTestUser(transactionHost.tx);

      const member = await createTestSpaceMember(transactionHost.tx, {
        spaceId: space.id,
        memberId: user2.id,
      });

      const topic = await createTestTopic(transactionHost.tx, {
        spaceId: space.id,
      });

      const apiKey = await createTestSpaceApiKey(transactionHost.tx, {
        spaceId: space.id,
        spaceMemberId: owner.id,
      });

      const { ping } = await createTestPing(transactionHost.tx, {
        apiKeyId: apiKey.id,
        topicId: topic.id,
        title: "Test",
        content: "Test ping",
        contentType: "MARKDOWN",
      });

      const timestamp = new Date("2025-12-06T10:30:00.000Z");

      await sut.readPings({
        topicId: topic.id,
        spaceMemberId: owner.id,
        timestamp,
      });

      const [ownerReads] = await transactionHost.tx
        .select()
        .from(schema.pingReads)
        .where(eq(schema.pingReads.spaceMemberId, owner.id));

      expect(ownerReads.pingId).toBe(ping.id);
      expect(ownerReads.spaceMemberId).toBe(owner.id);

      const [memberReads] = await transactionHost.tx
        .select()
        .from(schema.pingReads)
        .where(eq(schema.pingReads.spaceMemberId, member.id));

      expect(memberReads).toBeNullable();
    });

    it("should not mark already read pings again", async () => {
      const user = await createTestUser(transactionHost.tx);
      const { space, owner } = await createTestSpace(transactionHost.tx, {
        ownerId: user.id,
      });
      const topic = await createTestTopic(transactionHost.tx, {
        spaceId: space.id,
      });
      const apiKey = await createTestSpaceApiKey(transactionHost.tx, {
        spaceId: space.id,
        spaceMemberId: owner.id,
      });

      const { ping: ping1 } = await createTestPing(transactionHost.tx, {
        apiKeyId: apiKey.id,
        topicId: topic.id,
        title: "Ping 1",
        content: "First ping",
        contentType: "MARKDOWN",
      });

      const firstTimestamp = new Date("2025-12-06T10:30:00.000Z");

      await sut.readPings({
        topicId: topic.id,
        spaceMemberId: owner.id,
        timestamp: firstTimestamp,
      });

      const readsAfterFirst = await transactionHost.tx
        .select()
        .from(schema.pingReads)
        .where(eq(schema.pingReads.spaceMemberId, owner.id));

      expect(readsAfterFirst).toHaveLength(1);

      const { ping: ping2 } = await createTestPing(transactionHost.tx, {
        apiKeyId: apiKey.id,
        topicId: topic.id,
        title: "Ping 2",
        content: "Second ping",
        contentType: "MARKDOWN",
      });

      const secondTimestamp = new Date("2025-12-06T10:31:00.000Z");

      await sut.readPings({
        topicId: topic.id,
        spaceMemberId: owner.id,
        timestamp: secondTimestamp,
      });

      const readsAfterSecond = await transactionHost.tx
        .select()
        .from(schema.pingReads)
        .where(eq(schema.pingReads.spaceMemberId, owner.id));

      expect(readsAfterSecond).toHaveLength(2);

      const ping1Read = readsAfterSecond.find((r) => r.pingId === ping1.id);
      const ping2Read = readsAfterSecond.find((r) => r.pingId === ping2.id);

      expect(ping1Read).toBeDefined();
      expect(ping1Read!.timestamp).toEqual(firstTimestamp);

      expect(ping2Read).toBeDefined();
      expect(ping2Read!.timestamp).toEqual(secondTimestamp);
    });

    it("should preserve timestamp precision when marking pings as read", async () => {
      const user = await createTestUser(transactionHost.tx);

      const { space, owner } = await createTestSpace(transactionHost.tx, {
        ownerId: user.id,
      });

      const topic = await createTestTopic(transactionHost.tx, {
        spaceId: space.id,
      });

      const apiKey = await createTestSpaceApiKey(transactionHost.tx, {
        spaceId: space.id,
        spaceMemberId: owner.id,
      });

      await createTestPing(transactionHost.tx, {
        apiKeyId: apiKey.id,
        topicId: topic.id,
        title: "Test",
        content: "Test ping",
        contentType: "MARKDOWN",
      });

      const specificTimestamp = new Date("2025-12-06T10:30:45.123Z");

      await sut.readPings({
        topicId: topic.id,
        spaceMemberId: owner.id,
        timestamp: specificTimestamp,
      });

      const [persistedRead] = await transactionHost.tx
        .select()
        .from(schema.pingReads)
        .where(eq(schema.pingReads.spaceMemberId, owner.id));

      expect(persistedRead).toBeDefined();
      expect(persistedRead.timestamp).toBeInstanceOf(Date);

      const expectedTimestamp = new Date("2025-12-06T10:30:45.000Z");
      expect(persistedRead.timestamp.toISOString()).toBe(
        expectedTimestamp.toISOString(),
      );
    });
  });
});
