export type CreateSpaceRequest = {
  name: string;
  shortDescription: string;
  description?: string;
  slug?: string;
};

export type CreateSpaceResponse = {
  spaceId: string;
};

export type ListSpacesRequest = {
  cursor?: string;
  limit?: number;
};

export type ListSpacesResponse = {
  items: {
    id: string;
    name: string;
    shortDescription: string;
    isPinned: boolean;
    lastPingAt: string | null;
    unreadCount: number;
  }[];
  pagination: {
    nextCursor: string | null;
    hasNextPage: boolean;
    limit: number;
  };
};

export type GetSpaceRequest = {
  spaceId: string;
}

export type GetSpaceResponse = {
  id: string;
  name: string;
  shortDescription: string;
  description: string | null;
  slug: string;
  memberCount: number;
}