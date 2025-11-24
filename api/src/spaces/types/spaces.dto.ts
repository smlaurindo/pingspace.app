export type CreateSpaceRequest = {
  name: string;
  shortDescription: string;
  description?: string;
  slug?: string;
  userId: string;
};

export type CreateSpaceResponse = {
  spaceId: string;
};

export type DeleteSpaceRequest = {
  spaceId: string;
  userId: string;
};

export type CreateSpaceApiKeyRequest = {
  spaceId: string;
  userId: string;
  name: string;
  description?: string;
};

export type CreateSpaceApiKeyResponse = {
  id: string;
  name: string;
  description: string | null;
  key: string;
  createdAt: string;
};

export type ListSpaceApiKeysRequest = {
  spaceId: string;
  userId: string;
  cursor?: string;
  limit: number;
  type: "ACTIVE" | "INACTIVE";
};

export type ListSpaceApiKeysResponse = {
  items: {
    id: string;
    name: string;
    description: string | null;
    status: "ACTIVE" | "INACTIVE";
    createdAt: string;
    lastUsedAt: string | null;
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
