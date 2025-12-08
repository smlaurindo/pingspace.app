import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
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
const deleteSpaceParamSchema = z.object({
  spaceId: z.cuid2("Invalid format"),
});
const createSpaceApiKeyParamSchema = z.object({
  spaceId: z.cuid2("Invalid format"),
});
const createSpaceApiKeySchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name must be at most 50 characters")
    .transform((val) => val.trim()),
  description: z
    .string()
    .max(200, "Description must be at most 200 characters")
    .optional()
    .transform((val) => val?.trim() || undefined),
});
const listSpaceApiKeysParamSchema = z.object({
  spaceId: z.cuid2("Invalid format"),
});
const listSpaceApiKeysQuerySchema = z.object({
  cursor: z.string().optional(),
  type: z.enum(["ACTIVE", "INACTIVE"]).optional().default("ACTIVE"),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

const createSpaceSchemaPipe = new ZodValidationPipe(createSpaceSchema);
const deleteSpaceParamSchemaPipe = new ZodValidationPipe(
  deleteSpaceParamSchema,
);
const createSpaceApiKeyParamSchemaPipe = new ZodValidationPipe(
  createSpaceApiKeyParamSchema,
);
const createSpaceApiKeySchemaPipe = new ZodValidationPipe(
  createSpaceApiKeySchema,
);
const listSpaceApiKeysParamSchemaPipe = new ZodValidationPipe(
  listSpaceApiKeysParamSchema,
);
const listSpaceApiKeysQuerySchemaPipe = new ZodValidationPipe(
  listSpaceApiKeysQuerySchema,
);
const pinSpaceSchema = z.object({
  pinned: z.boolean(),
});
const pinSpaceParamSchema = z.object({
  spaceId: z.cuid2("Invalid format"),
});
const pinSpaceSchemaPipe = new ZodValidationPipe(pinSpaceSchema);
const pinSpaceParamSchemaPipe = new ZodValidationPipe(pinSpaceParamSchema);

type CreateSpaceRequestBody = z.infer<typeof createSpaceSchema>;
type CreateSpaceApiKeyRequestBody = z.infer<typeof createSpaceApiKeySchema>;
type DeleteSpaceRequestParam = z.infer<typeof deleteSpaceParamSchema>;
type CreateSpaceApiKeyRequestParam = z.infer<
  typeof createSpaceApiKeyParamSchema
>;
type ListSpaceApiKeysRequestParam = z.infer<typeof listSpaceApiKeysParamSchema>;
type ListSpaceApiKeysRequestQuery = z.infer<typeof listSpaceApiKeysQuerySchema>;
type PinSpaceRequestBody = z.infer<typeof pinSpaceSchema>;
type PinSpaceRequestParam = z.infer<typeof pinSpaceParamSchema>;

@Controller()
@UseFilters(new SpacesExceptionFilter())
export class SpacesController {
  public constructor(private readonly spacesService: SpacesService) {}

  @Post("/v1/spaces")
  async createSpace(
    @Body(createSpaceSchemaPipe) body: CreateSpaceRequestBody,
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
    @Param(deleteSpaceParamSchemaPipe) params: DeleteSpaceRequestParam,
    @AuthenticationPrincipal() jwt: UserPayload,
    @Res() reply: FastifyReply,
  ) {
    const { spaceId } = params;
    const { sub } = jwt;

    await this.spacesService.deleteSpaceById({
      spaceId,
      userId: sub,
    });

    reply.status(HttpStatus.NO_CONTENT).send();
  }

  @Post("/v1/spaces/:spaceId/api-keys")
  async createSpaceApiKey(
    @Param(createSpaceApiKeyParamSchemaPipe)
    params: CreateSpaceApiKeyRequestParam,
    @Body(createSpaceApiKeySchemaPipe) body: CreateSpaceApiKeyRequestBody,
    @AuthenticationPrincipal() jwt: UserPayload,
    @Res() reply: FastifyReply,
  ) {
    const { spaceId } = params;
    const { name, description } = body;
    const { sub } = jwt;

    const apiKey = await this.spacesService.createApiKey({
      name,
      description,
      spaceId,
      userId: sub,
    });

    reply.status(HttpStatus.CREATED).send(apiKey);
  }

  @Get("/v1/spaces/:spaceId/api-keys")
  async listSpaceApiKeys(
    @Param(listSpaceApiKeysParamSchemaPipe)
    params: ListSpaceApiKeysRequestParam,
    @Query(listSpaceApiKeysQuerySchemaPipe) query: ListSpaceApiKeysRequestQuery,
    @AuthenticationPrincipal() jwt: UserPayload,
    @Res() reply: FastifyReply,
  ) {
    const { spaceId } = params;
    const { cursor, limit, type } = query;
    const { sub } = jwt;

    const result = await this.spacesService.listApiKeys({
      spaceId,
      userId: sub,
      cursor,
      limit,
      type,
    });

    reply.status(HttpStatus.OK).send(result);
  }

  @Put("/v1/spaces/:spaceId/pin")
  async pinSpace(
    @Param(pinSpaceParamSchemaPipe) params: PinSpaceRequestParam,
    @Body(pinSpaceSchemaPipe) body: PinSpaceRequestBody,
    @AuthenticationPrincipal() jwt: UserPayload,
    @Res() reply: FastifyReply,
  ) {
    const { spaceId } = params;
    const { pinned } = body;
    const { sub } = jwt;

    await this.spacesService.updateSpacePin({
      spaceId,
      userId: sub,
      pinned,
    });

    reply.status(HttpStatus.OK).send({ pinned });
  }
}
