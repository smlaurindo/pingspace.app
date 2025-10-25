export type CreateTopicData = {
  spaceId: string;
  name: string;
  emoji: string;
  slug: string;
  shortDescription: string;
  description?: string;
};

export interface TopicInfo {
  id: string;
  spaceId: string;
  name: string;
  slug: string;
  emoji: string;
  shortDescription: string;
  description: string | null;
  createdAt: string;
  updatedAt: string | null;
}
