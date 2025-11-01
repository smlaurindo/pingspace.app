import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import { ApiKeyPayload } from "@/@types/api-key-payload";

export const ApiKeyPrincipal = createParamDecorator(
  (_: never, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();

    return request.apiKey as ApiKeyPayload;
  },
);
