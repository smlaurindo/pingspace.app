export type CreateSpaceRequest = {
  name: string;
  shortDescription: string;
  description?: string;
  slug?: string;
};

export type CreateSpaceResponse = {
  spaceId: string;
};
