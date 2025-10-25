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
