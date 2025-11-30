export type SpaceMemberRole = "OWNER" | "ADMIN" | "MEMBER";

export type SpaceMembershipInfo = {
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

export type CreateMembershipData = {
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
