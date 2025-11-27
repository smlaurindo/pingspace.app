export type CreateTopicRequest = {
  name: string;
  emoji: string;
  shortDescription: string;
  description?: string;
  slug?: string;
};

export type CreateTopicResponse = {
  topicId: string;
};

export type GetTopicResponse = {
  id: string;
  spaceId: string;
  name: string;
  slug: string;
  emoji: string;
  shortDescription: string;
  description: string | null;
  createdAt: string;
  updatedAt: string | null;
};