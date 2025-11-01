export type CreateApiKeyRequest = {
  spaceId: string;
  userId: string;
  name: string;
  description?: string;
};

export type CreateApiKeyResponse = {
  id: string;
  name: string;
  description: string | null;
  key: string;
  createdAt: string;
};
