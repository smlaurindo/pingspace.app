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
