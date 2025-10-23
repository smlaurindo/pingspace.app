export type CreateSpaceRequest = {
  name: string;
  shortDescription: string;
  description?: string;
  slug?: string;
  ownerId: string;
};

export type CreateSpaceResponse = {
  spaceId: string;
};
