import { BaseException } from "@/shared/exceptions/base-exception";

export class TopicNotFoundException extends BaseException {
  public override code: string = "TOPIC_NOT_FOUND";
  public override message: string;
  public override details: string =
    "The topic you are trying to send a ping to does not exist. Please check the topic slug and try again.";

  constructor(slug: string) {
    super(`Topic with slug '${slug}' not found`);
    this.message = `Topic with slug '${slug}' not found`;
  }
}
