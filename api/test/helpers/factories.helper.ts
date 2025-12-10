import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "@/drizzle/schema";
import { hash } from "bcrypt";
import { and, eq, InferInsertModel } from "drizzle-orm";
import { faker } from "@faker-js/faker";
import { v7 as uuidv7 } from "uuid";

type TestDatabase = NodePgDatabase<typeof schema>;

/**
 * Factory for creating test users
 */
export async function createTestUser(
  db: TestDatabase,
  overrides: Partial<{
    email: string;
    password: string;
    nickname: string;
  }> = {},
) {
  const email =
    overrides.email ||
    faker.internet.exampleEmail({ allowSpecialCharacters: false });
  const password = overrides.password || faker.internet.password({ length: 8 });
  const nickname = overrides.nickname || faker.internet.username();

  const passwordHash = await hash(password, 4);

  const [user] = await db
    .insert(schema.users)
    .values({
      email,
      passwordHash,
      nickname,
      ...overrides,
    })
    .returning();

  return { ...user, password };
}

/**
 * Factory for creating test spaces
 */
export async function createTestSpace(
  db: TestDatabase,
  { ownerId }: { ownerId: string },
  overrides: Partial<
    Omit<InferInsertModel<typeof schema.spaces>, "ownerId">
  > = {},
) {
  const name = overrides.name || `Test Space ${uuidv7()}`;
  const slug = overrides.slug || `test-space-${uuidv7()}`;
  const shortDescription =
    overrides.shortDescription || faker.lorem.sentence({ min: 3, max: 5 });
  const description = overrides.description || faker.lorem.words(10);

  const [space] = await db
    .insert(schema.spaces)
    .values({
      name,
      slug,
      shortDescription,
      description,
      ownerId,
      ...overrides,
    })
    .returning();

  const [owner] = await db
    .insert(schema.spaceMembers)
    .values({
      memberId: ownerId,
      spaceId: space.id,
      role: schema.SPACE_ROLE_OWNER,
    })
    .returning();

  return { space, owner };
}

/**
 * Factory for creating test space members
 */
export async function createTestSpaceMember(
  db: TestDatabase,
  { spaceId, memberId }: { spaceId: string; memberId: string },
  overrides: Partial<InferInsertModel<typeof schema.spaceMembers>> = {},
) {
  const role = overrides.role || schema.SPACE_ROLE_MEMBER;
  const joinedAt = overrides.joinedAt || new Date();

  const [spaceMember] = await db
    .insert(schema.spaceMembers)
    .values({
      spaceId,
      memberId,
      role,
      joinedAt,
      ...overrides,
    })
    .returning();

  return spaceMember;
}

/**
 * Factory for creating test topics
 */
export async function createTestTopic(
  db: TestDatabase,
  { spaceId }: { spaceId: string },
  overrides: Partial<
    Omit<InferInsertModel<typeof schema.topics>, "spaceId">
  > = {},
) {
  const name = overrides.name || faker.lorem.word();
  const slug = overrides.slug || faker.lorem.slug({ min: 1, max: 4 });
  const emoji = overrides.emoji || faker.internet.emoji();
  const shortDescription =
    overrides.shortDescription || faker.lorem.sentence({ min: 3, max: 5 });
  const description = overrides.description || faker.lorem.words(10);

  const [topic] = await db
    .insert(schema.topics)
    .values({
      name,
      slug,
      emoji,
      shortDescription,
      description,
      spaceId,
      ...overrides,
    })
    .returning();

  return topic;
}

/**
 * Factory for creating test Space API Keys
 */
export async function createTestSpaceApiKey(
  db: TestDatabase,
  data: {
    spaceId: string;
    spaceMemberId: string;
  },
  overrides: Partial<
    Omit<
      InferInsertModel<typeof schema.spaceApiKeys>,
      "spaceId" | "spaceMemberId"
    >
  > = {},
) {
  const name = overrides.name || faker.lorem.word(5);
  const description = overrides.description || faker.lorem.words(5);
  const rawSecret = uuidv7();
  const secretHash = await hash(rawSecret, 6);

  const [apiKey] = await db
    .insert(schema.spaceApiKeys)
    .values({
      name,
      description,
      spaceId: data.spaceId,
      createdBy: data.spaceMemberId,
      keyHash: secretHash,
      ...overrides,
    })
    .returning();

  return { ...apiKey, rawSecret, fullKey: `${apiKey.id}.${rawSecret}` };
}

/**
 * Factory for creating test pings
 */
export async function createTestPing(
  db: TestDatabase,
  data: {
    topicId: string;
    apiKeyId: string;
    title?: string;
    content?: string;
    contentType?: "JSON" | "MARKDOWN";
    actions?: Array<{
      type: "HTTP" | "LINK";
      label: string;
      url: string;
      method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
      headers?: string;
      body?: string;
    }>;
    tags?: string[];
  },
) {
  const title = data.title || faker.lorem.sentence({ min: 3, max: 6 });
  const content = data.content || faker.lorem.paragraphs(2);
  const contentType = data.contentType || "MARKDOWN";

  const [ping] = await db
    .insert(schema.pings)
    .values({
      topicId: data.topicId,
      apiKeyId: data.apiKeyId,
      title,
      content,
      contentType,
    })
    .returning();

  const actions = data.actions || [];
  const createdActions = await Promise.all(
    actions.map(async (action) => {
      const [createdAction] = await db
        .insert(schema.pingActions)
        .values({
          pingId: ping.id,
          type: action.type,
          label: action.label,
          url: action.url,
          method: action.method || null,
          headers: action.headers || null,
          body: action.body || null,
        })
        .returning();
      return createdAction;
    }),
  );

  // Create tags if provided
  const tags = data.tags || [];
  const createdTags = await Promise.all(
    tags.map(async (tagName) => {
      // Check if tag already exists for this topic
      const [existingTag] = await db
        .select()
        .from(schema.topicTags)
        .where(
          and(
            eq(schema.topicTags.name, tagName),
            eq(schema.topicTags.topicId, data.topicId),
          ),
        )
        .limit(1);

      let tag = existingTag;

      if (!tag) {
        const [newTag] = await db
          .insert(schema.topicTags)
          .values({
            name: tagName,
            topicId: data.topicId,
          })
          .returning();
        tag = newTag;
      }

      await db.insert(schema.pingTags).values({
        pingId: ping.id,
        tagId: tag.id,
      });

      return tag;
    }),
  );

  return { ping, actions: createdActions, tags: createdTags };
}
