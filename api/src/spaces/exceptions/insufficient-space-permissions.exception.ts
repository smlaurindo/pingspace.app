import { BaseException } from "@/shared/exceptions/base-exception";

export class InsufficientSpacePermissionsException extends BaseException {
  public override code: string = "INSUFFICIENT_SPACE_PERMISSIONS";
  public override message: string;
  public override details: string;

  constructor(spaceId: string, requiredRoles: string[], action?: string) {
    const roleList = requiredRoles.join(" or ");
    const actionText = action ? ` to ${action}` : "";
    const message = `Insufficient permissions${actionText} in space '${spaceId}'`;

    super(message);
    this.name = "InsufficientSpacePermissionsException";
    this.message = message;
    this.details = `You need to be ${roleList}${actionText}.`;
  }
}
