import { BaseException } from "@/shared/exceptions/base-exception";

export class SpaceApiKeyNotFoundException extends BaseException {
  override code: string = "API_KEY_NOT_FOUND";
  override message: string;
  override details: string =
    "The API key you are trying to use does not exist. Please check the API key ID and try again.";

  constructor(apiKeyId: string) {
    const message = `API key with id "${apiKeyId}" not found`;
    super(message);
    this.message = message;
  }
}
