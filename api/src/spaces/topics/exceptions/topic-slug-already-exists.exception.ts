import { BaseException } from "@/shared/exceptions/base-exception";

export class TopicSlugAlreadyExistsException extends BaseException {
  public override code: string = "TOPIC_SLUG_ALREADY_EXISTS";
  public override message: string;
  public override details: string =
    "A topic with this slug has already been created in this space. Please choose a different slug.";

  constructor(slug: string) {
    super(`Topic with slug '${slug}' already exists in this space`);
    this.name = "TopicSlugAlreadyExistsException";
    this.message = `Topic with slug '${slug}' already exists in this space`;
  }
}
