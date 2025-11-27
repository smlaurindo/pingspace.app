import { BaseException } from "@/shared/exceptions/base-exception";

export class TopicNotFoundException extends BaseException {
  public override code: string = "TOPIC_NOT_FOUND";
  public override message: string;
  public override details: string =
    "The topic does not exist. Please check the topic id and try again.";

  constructor(topicId: string) {
    super(`Topic with id '${topicId}' not found`);
    this.message = `Topic with id '${topicId}' not found`;
  }
}
