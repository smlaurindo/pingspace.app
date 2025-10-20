import { BaseException } from "@/shared/exceptions/base-exception";

export class UserAlreadyExistsException extends BaseException {
  public override code: string = "USER_ALREADY_EXISTS";
  public override message: string = "User already exists";
  public override details: string =
    "A user with this email is already registered.";

  public constructor() {
    super("User already exists");
    this.name = "UserAlreadyExistsException";
  }
}
