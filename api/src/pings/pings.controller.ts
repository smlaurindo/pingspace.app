import {
  Body,
  Controller,
  HttpStatus,
  Param,
  Post,
  Res,
  UseFilters,
  UseGuards,
} from "@nestjs/common";
import { z } from "zod";
import type { FastifyReply } from "fastify";
import { ZodValidationPipe } from "@/shared/pipes/zod-validation.pipe";
import { PingsService } from "./pings.service";
import { PingsExceptionFilter } from "./pings.filter";
import { ApiKeyPrincipal } from "@/shared/decorators/api-key-principal.decorator";
import { ApiKeyGuard } from "@/api-keys/guards/api-key.guard";
import type { ApiKeyPayload } from "@/@types/api-key-payload";

const baseActionSchema = z.object({
  type: z.enum(["HTTP", "LINK"]),
  label: z.string().min(1, "Label is required"),
});

const httpActionSchema = baseActionSchema.extend({
  type: z.literal("HTTP"),
  url: z.url({
    message: "Invalid URL format",
    protocol: /^https$/,
    hostname: z.regexes.domain,
    normalize: true,
  }),
  method: z.enum(["GET", "POST", "PATCH", "PUT", "DELETE"]).default("POST"),
  headers: z
    .record(z.string(), z.string())
    .optional()
    .describe("HTTP headers as key-value pairs"),
  body: z
    .record(z.string(), z.unknown())
    .optional()
    .describe("Request body as JSON object"),
});

const linkActionSchema = baseActionSchema.extend({
  type: z.literal("LINK"),
  url: z.url({ message: "Invalid URL format", normalize: true }),
});

const actionUnionSchema = z.discriminatedUnion("type", [
  httpActionSchema,
  linkActionSchema,
]);

const createPingBodySchema = z
  .object({
    title: z
      .string()
      .max(200, "Title must be at most 200 characters")
      .optional(),
    contentType: z.enum(["MARKDOWN", "JSON"], "Content type is required"),
    content: z
      .string()
      .min(1, "Content is required")
      .max(10000, "Content must be at most 10000 characters"),
    actions: z
      .array(actionUnionSchema)
      .max(4, "Actions must be at most 4 items")
      .default([]),
    tags: z
      .array(z.string().min(1, "Tag must be at least 1 character"))
      .max(10, "Tags must be at most 10 items")
      .default([]),
  })
  .refine(
    (data) => {
      if (data.contentType === "JSON") {
        return data.title !== undefined && data.title.trim().length > 0;
      }

      return true;
    },
    {
      message: "Title is required when content type is JSON",
      path: ["title"],
    },
  );

const createPingParamsSchema = z.object({
  topicSlug: z.string().min(1, "Topic slug is required"),
});

const createPingBodyPipe = new ZodValidationPipe(createPingBodySchema);
const createPingParamsPipe = new ZodValidationPipe(createPingParamsSchema);

type CreatePingRequestParams = z.infer<typeof createPingParamsSchema>;
type CreatePingRequestBody = z.infer<typeof createPingBodySchema>;

@Controller()
@UseFilters(PingsExceptionFilter)
export class PingsController {
  constructor(private readonly pingsService: PingsService) {}

  @Post("/v1/topics/:topicSlug/pings")
  @UseGuards(ApiKeyGuard)
  async create(
    @Param(createPingParamsPipe) params: CreatePingRequestParams,
    @Body(createPingBodyPipe) body: CreatePingRequestBody,
    @ApiKeyPrincipal() apiKey: ApiKeyPayload,
    @Res() reply: FastifyReply,
  ) {
    const { title, contentType, content, actions, tags } = body;
    const { topicSlug } = params;
    const { id: apiKeyId } = apiKey;

    const ping = await this.pingsService.createPing({
      title,
      contentType,
      content,
      tags,
      actions,
      topicSlug,
      apiKeyId,
    });

    return reply.status(HttpStatus.CREATED).send({
      id: ping.id,
      title: ping.title,
      content: ping.content,
      contentType: ping.contentType,
      tags: ping.tags,
      actions: ping.actions,
      topic: {
        id: ping.topic.id,
        slug: ping.topic.slug,
      },
      spaceId: ping.spaceId,
      createdAt: ping.createdAt,
    });
  }
}
