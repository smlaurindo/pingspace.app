import { ExecutionContext, createParamDecorator } from "@nestjs/common";
import type { UserPayload } from "@/@types/user-jwt-payload";

export const AuthenticationPrincipal = createParamDecorator(
  (_: never, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();

    return request.user as UserPayload;
  },
);
