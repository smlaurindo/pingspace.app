export type SpaceMembershipInfo = {
  role: "OWNER" | "ADMIN" | "MEMBER";
  spaceId: string;
  memberId: string;
};
