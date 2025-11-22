import { Body, Controller, HttpStatus, Param, Post, Res } from "@nestjs/common";
import type { FastifyReply } from "fastify";
import { z } from "zod";
import type { UserPayload } from "@/@types/user-jwt-payload";
import { AuthenticationPrincipal } from "@/shared/decorators/authentication-principal.decorator";
import { ZodValidationPipe } from "@/shared/pipes/zod-validation.pipe";
import { ZodCUIDParameterValidationPipe } from "@/shared/pipes/zod-cuid-validation.pipe";
import { ApiKeysService } from "./api-keys.service";

const createSpaceApiKeySchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name must be at most 50 characters")
    .transform((val) => val.trim()),
  description: z
    .string()
    .max(1000, "Description must be at most 1000 characters")
    .optional()
    .transform((val) => val?.trim() || undefined),
});

const createSpaceApiKeyValidationPipe = new ZodValidationPipe(
  createSpaceApiKeySchema,
);

type CreateSpaceApiKeyRequestBody = z.infer<typeof createSpaceApiKeySchema>;

@Controller()
export class ApiKeysController {
  public constructor(private readonly apiKeysService: ApiKeysService) {}

  @Post("/v1/spaces/:spaceId/api-key")
  async createSpaceApiKey(
    @Param("spaceId", ZodCUIDParameterValidationPipe) spaceId: string,
    @Body(createSpaceApiKeyValidationPipe) body: CreateSpaceApiKeyRequestBody,
    @AuthenticationPrincipal() jwt: UserPayload,
    @Res() reply: FastifyReply,
  ) {
    const { sub } = jwt;
    const { name, description } = body;

    const apiKey = await this.apiKeysService.createApiKey({
      name,
      description,
      spaceId,
      userId: sub,
    });

    return reply.status(HttpStatus.CREATED).send({ apiKey });
  }
}
