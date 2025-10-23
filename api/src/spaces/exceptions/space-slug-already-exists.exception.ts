import { BaseException } from "@/shared/exceptions/base-exception";

export class SpaceSlugAlreadyExistsException extends BaseException {
  public override code: string = "SPACE_SLUG_ALREADY_EXISTS";
  public override message: string;
  public override details: string =
    "A space with this slug has already been created. Please choose a different slug.";

  constructor(slug: string) {
    super(`Space with slug '${slug}' already exists`);
    this.name = "SpaceSlugAlreadyExistsException";
    this.message = `Space with slug '${slug}' already exists`;
  }
}
