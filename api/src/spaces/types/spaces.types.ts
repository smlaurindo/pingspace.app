export type SpaceMemberRole = "OWNER" | "ADMIN" | "MEMBER";

export type SpaceMember = {
  id: string;
  role: SpaceMemberRole;
  spaceId: string;
  memberId: string;
};

export type CreateSpaceData = {
  name: string;
  slug: string;
  shortDescription: string;
  description?: string;
  ownerId: string;
};

export type CreateSpaceMemberData = {
  role: SpaceMemberRole;
  spaceId: string;
  memberId: string;
};

export type CreateSpaceApiKeyData = {
  spaceId: string;
  keyHash: string;
  name: string;
  description?: string;
  createdBy: string;
};

export type SpaceApiKey = {
  id: string;
  spaceId: string;
  keyHash: string;
  name: string;
  description: string | null;
  status: "ACTIVE" | "INACTIVE";
  createdBy: string;
  createdAt: Date;
  lastUsedAt: Date | null;
};

export type ListSpaceApiKeyQuery = {
  spaceId: string;
  cursor?: string;
  limit: number;
  type: "ACTIVE" | "INACTIVE";
};

export type PaginatedSpaceApiKeys = {
  items: {
    id: string;
    name: string;
    description: string | null;
    status: "ACTIVE" | "INACTIVE";
    createdAt: Date;
    lastUsedAt: Date | null;
    createdBy: {
      id: string;
      nickname: string;
    } | null;
  }[];
  pagination: {
    nextCursor: string | null;
    hasNextPage: boolean;
    limit: number;
  };
};

export type ListSpacesQuery = {
  memberId: string;
  cursor?: string;
  limit: number;
};

export type PaginatedSpacesWithLastPingAtAndUnreadCount = {
  items: {
    id: string;
    name: string;
    shortDescription: string;
    isPinned: boolean;
    lastPingAt: Date | null;
    unreadCount: number;
  }[];
  pagination: {
    nextCursor: string | null;
    hasNextPage: boolean;
    limit: number;
  };
};
