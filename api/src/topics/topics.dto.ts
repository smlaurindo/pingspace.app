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
