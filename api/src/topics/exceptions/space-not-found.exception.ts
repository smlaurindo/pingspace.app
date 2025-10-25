import { BaseException } from "@/shared/exceptions/base-exception";

export class SpaceNotFoundException extends BaseException {
  public override code: string = "SPACE_NOT_FOUND";
  public override message: string;
  public override details: string =
    "The requested space does not exist or you don't have access to it.";

  constructor(spaceId: string) {
    super(`Space with id '${spaceId}' not found`);
    this.name = "SpaceNotFoundException";
    this.message = `Space with id '${spaceId}' not found`;
  }
}
