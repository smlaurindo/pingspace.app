import { BaseException } from "@/shared/exceptions/base-exception";

export class UnauthorizedSpaceAccessException extends BaseException {
  public override code: string = "UNAUTHORIZED_SPACE_ACCESS";
  public override message: string =
    "You don't have permission to access this space";
  public override details: string = "You must be a member of the space.";

  constructor(spaceId: string, details?: string) {
    super(`You don't have permission to access space '${spaceId}'`);
    this.name = "UnauthorizedSpaceAccessException";

    if (details) {
      this.details = details;
    }
  }
}
