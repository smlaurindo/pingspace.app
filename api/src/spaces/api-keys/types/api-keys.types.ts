export type CreateApiKeyData = {
  spaceId: string;
  keyHash: string;
  name: string;
  description?: string;
  createdBy: string;
};

export type ApiKey = {
  id: string;
  spaceId: string;
  keyHash: string;
  name: string;
  description: string | null;
  status: "ACTIVE" | "INACTIVE";
  createdBy: string;
  createdAt: string;
  lastUsedAt: string | null;
};
