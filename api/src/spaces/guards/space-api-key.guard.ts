import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { FastifyRequest } from "fastify";
import { compare } from "bcrypt";
import { ApiKeyPayload } from "@/@types/api-key-payload";
import { IS_PUBLIC_KEY } from "@/shared/decorators/skip-auth.decorator";
import { SpaceApiKeyRepository } from "../repositories/space-api-key.repository";

@Injectable()
export class SpaceApiKeyGuard implements CanActivate {
  constructor(
    private readonly spaceApiKeyRepository: SpaceApiKeyRepository,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const endpointIsPublic = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (endpointIsPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<FastifyRequest>();

    const apiKey = this.extractApiKeyFromRequest(request);

    if (!apiKey) {
      throw new UnauthorizedException("API Key not found");
    }

    const [keyId, rawSecret] = apiKey.split(".");

    if (!keyId || !rawSecret) {
      throw new UnauthorizedException("Malformed API Key");
    }

    const storedApiKey = await this.spaceApiKeyRepository.findById(keyId);

    if (!storedApiKey) {
      throw new UnauthorizedException("API Key not found");
    }

    const isValid = await compare(apiKey, storedApiKey.keyHash);

    if (!isValid) {
      throw new UnauthorizedException("Invalid API Key");
    }

    if (storedApiKey.status === "INACTIVE") {
      throw new UnauthorizedException("API Key is inactive");
    }

    const payload: ApiKeyPayload = {
      id: storedApiKey.id,
      spaceId: storedApiKey.spaceId,
    };

    request["apiKey"] = payload;

    return true;
  }

  private extractApiKeyFromRequest(
    request: FastifyRequest,
  ): string | undefined {
    let token: string | undefined;

    const authHeader = request.headers["authorization"];

    if (authHeader?.startsWith("ApiKey ")) {
      token = authHeader.split(" ")[1];
    }

    const apiKeyHeader = request.headers["x-api-key"];

    if (!token && apiKeyHeader) {
      token = apiKeyHeader as string;
    }

    return token;
  }
}
