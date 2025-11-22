export type SpaceMemberRole = "OWNER" | "ADMIN" | "MEMBER";

export type SpaceMembershipInfo = {
  role: SpaceMemberRole;
  spaceId: string;
  memberId: string;
};

export type CreateSpaceData = {
  name: string;
  slug: string;
  shortDescription: string;
  description?: string;
  ownerId: string;
};

export type CreateMembershipData = {
  role: SpaceMemberRole;
  spaceId: string;
  memberId: string;
};

export type CreateSpaceApiKeyData = {
  spaceId: string;
  keyHash: string;
  name: string;
  description?: string;
  createdBy: string;
};

export type SpaceApiKey = {
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
