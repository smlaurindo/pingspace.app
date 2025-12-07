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
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date | null;
}

export interface TopicListWithUnreadCountAndLastPingAt {
  id: string;
  name: string;
  slug: string;
  emoji: string;
  shortDescription: string;
  isPinned: boolean;
  lastPingAt: Date | null;
  unreadCount: number;
}
