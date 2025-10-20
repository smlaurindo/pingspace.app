import type { UserPayload } from "@/@types/user-jwt-payload";
import { IS_PUBLIC_KEY } from "@/shared/decorators/skip-auth.decorator";
import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import {
  JsonWebTokenError,
  NotBeforeError,
  TokenExpiredError,
  JwtService,
} from "@nestjs/jwt";
import type { FastifyRequest } from "fastify";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext) {
    const endpointIsPublic = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (endpointIsPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    const token = this.extractTokenFromRequest(request);

    if (!token) {
      throw new UnauthorizedException("Token not found");
    }

    try {
      const payload = await this.jwt.verifyAsync<UserPayload>(token);
      request.user = payload;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException("Token expired");
      }

      if (error instanceof JsonWebTokenError) {
        throw new UnauthorizedException("Invalid token");
      }

      if (error instanceof NotBeforeError) {
        throw new UnauthorizedException("Token activated in the future");
      }

      throw new UnauthorizedException("Error verifying token");
    }

    return true;
  }

  private extractTokenFromRequest(request: FastifyRequest): string | undefined {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];

    if (type === "Bearer" && typeof token === "string" && token.length > 0) {
      return token;
    }

    const cookieToken = request.cookies?.["access_token"];

    if (typeof cookieToken === "string" && cookieToken.length > 0) {
      return cookieToken;
    }

    return undefined;
  }
}
