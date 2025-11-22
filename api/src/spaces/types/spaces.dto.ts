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
