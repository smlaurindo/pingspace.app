import { SetMetadata } from "@nestjs/common";

export const REQUIRED_ROLES_KEY = "requiredSpaceRoles";

export const SpaceRoles = (...roles: string[]) =>
  SetMetadata(REQUIRED_ROLES_KEY, roles);
