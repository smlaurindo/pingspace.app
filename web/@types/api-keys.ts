export type CreateApiKeyRequest = {
  name: string;
  description?: string;
};

export type CreateApiKeyResponse = {
  id: string;
  name: string;
  description: string | null;
  key: string;
};

export type ApiKey = {
  id: string;
  name: string;
  description?: string;
  status: "ACTIVE" | "INACTIVE";
  spaceId: string;
  createdBy: string;
  createdAt: string;
  lastUsedAt?: string;
  key?: string; // Only returned on creation
};

export type ListApiKeyRequest = {
  cursor?: string;
  limit?: number;
  type?: "ACTIVE" | "INACTIVE";
}

export type ListApiKeysResponse = {
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
