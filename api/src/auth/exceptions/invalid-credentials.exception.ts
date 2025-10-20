import { BaseException } from "@/shared/exceptions/base-exception";

export class InvalidCredentialsException extends BaseException {
  public override code: string = "INVALID_CREDENTIALS";
  public override message: string = "Invalid credentials";
  public override details: string =
    "The provided email or password is incorrect.";

  public constructor() {
    super("Invalid credentials");
    this.name = "InvalidCredentialsException";
  }
}
