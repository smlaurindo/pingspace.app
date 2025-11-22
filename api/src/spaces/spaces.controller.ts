import {
  Body,
  Controller,
  Delete,
  HttpStatus,
  Param,
  Post,
  Res,
  UseFilters,
} from "@nestjs/common";
import { z } from "zod";
import type { FastifyReply } from "fastify";
import { ZodValidationPipe } from "@/shared/pipes/zod-validation.pipe";
import { AuthenticationPrincipal } from "@/shared/decorators/authentication-principal.decorator";
import type { UserPayload } from "@/@types/user-jwt-payload";
import { SpacesService } from "./spaces.service";
import { SpacesExceptionFilter } from "./spaces.filter";
import { ZodCUIDParameterValidationPipe } from "@/shared/pipes/zod-cuid-validation.pipe";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const createSpaceSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name must be at most 50 characters")
    .transform((val) => val.trim()),
  shortDescription: z
    .string()
    .min(3, "Short description must be at least 3 characters")
    .max(40, "Short description must be at most 40 characters")
    .transform((val) => val.trim()),
  description: z
    .string()
    .max(500, "Description must be at most 500 characters")
    .transform((val) => val?.trim() || undefined)
    .optional(),
  slug: z
    .string()
    .transform((val) => {
      if (!val || val.trim() === "") return undefined;
      return val
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    })
    .refine(
      (val) => !val || (val.length >= 3 && val.length <= 40),
      "Slug must be between 3 and 40 characters",
    )
    .refine(
      (val) => !val || slugRegex.test(val),
      "Slug must contain only lowercase letters, numbers, and hyphens",
    )
    .optional(),
});

const createSpaceSchemaValidationPipe = new ZodValidationPipe(
  createSpaceSchema,
);

type CreateSpaceRequestBody = z.infer<typeof createSpaceSchema>;

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
@UseFilters(new SpacesExceptionFilter())
export class SpacesController {
  public constructor(private readonly spacesService: SpacesService) {}

  @Post("/v1/spaces")
  async createSpace(
    @Body(createSpaceSchemaValidationPipe) body: CreateSpaceRequestBody,
    @AuthenticationPrincipal() jwt: UserPayload,
    @Res() reply: FastifyReply,
  ) {
    const { name, shortDescription, description, slug } = body;
    const { sub } = jwt;

    const { spaceId } = await this.spacesService.createSpace({
      name,
      shortDescription,
      description,
      slug,
      userId: sub,
    });

    reply
      .status(HttpStatus.CREATED)
      .header("Location", `/v1/spaces/${spaceId}`)
      .send({ spaceId });
  }

  @Delete("/v1/spaces/:spaceId")
  async deleteSpace(
    @Param("spaceId") spaceId: string,
    @AuthenticationPrincipal() jwt: UserPayload,
    @Res() reply: FastifyReply,
  ) {
    const { sub } = jwt;

    await this.spacesService.deleteSpace({
      spaceId,
      userId: sub,
    });

    reply.status(HttpStatus.NO_CONTENT).send();
  }

  @Post("/v1/spaces/:spaceId/api-key")
  async createSpaceApiKey(
    @Param("spaceId", ZodCUIDParameterValidationPipe) spaceId: string,
    @Body(createSpaceApiKeyValidationPipe) body: CreateSpaceApiKeyRequestBody,
    @AuthenticationPrincipal() jwt: UserPayload,
    @Res() reply: FastifyReply,
  ) {
    const { sub } = jwt;
    const { name, description } = body;

    const apiKey = await this.spacesService.createApiKey({
      name,
      description,
      spaceId,
      userId: sub,
    });

    return reply.status(HttpStatus.CREATED).send({ apiKey });
  }
}
