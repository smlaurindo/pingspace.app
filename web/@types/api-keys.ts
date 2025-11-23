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

export type ListApiKeysResponse = {
  content: ApiKey[];
  
};
