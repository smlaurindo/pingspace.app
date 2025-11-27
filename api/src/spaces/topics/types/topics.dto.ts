export type CreateTopicRequest = {
  name: string;
  emoji: string;
  shortDescription: string;
  description?: string;
  slug?: string;
  spaceId: string;
  userId: string;
};

export type CreateTopicResponse = {
  topicId: string;
};

export type DeleteTopicRequest = {
  spaceId: string;
  topicId: string;
  userId: string;
};

export type GetTopicRequest = {
  spaceId: string;
  topicId: string;
  userId: string;
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
