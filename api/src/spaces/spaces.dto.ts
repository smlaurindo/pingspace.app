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
