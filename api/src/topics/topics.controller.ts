import {
  Body,
  Controller,
  HttpStatus,
  Param,
  Post,
  Res,
  UseFilters,
} from "@nestjs/common";
import { z } from "zod";
import type { FastifyReply } from "fastify";
import type { UserPayload } from "@/@types/user-jwt-payload";
import { ZodValidationPipe } from "@/shared/pipes/zod-validation.pipe";
import { AuthenticationPrincipal } from "@/shared/decorators/authentication-principal.decorator";
import { TopicsService } from "./topics.service";
import { TopicsExceptionFilter } from "./topics.filter";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const createTopicSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name must be at most 50 characters"),
  emoji: z.string().min(1, "Emoji is required"),
  shortDescription: z
    .string()
    .min(3, "Short description must be at least 3 characters")
    .max(100, "Short description must be at most 100 characters")
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

const createTopicSchemaValidationPipe = new ZodValidationPipe(
  createTopicSchema,
);

type CreateTopicRequestBody = z.infer<typeof createTopicSchema>;

@Controller()
@UseFilters(new TopicsExceptionFilter())
export class TopicsController {
  public constructor(private readonly topicsService: TopicsService) {}

  @Post("/v1/spaces/:spaceId/topics")
  async createTopic(
    @Param("spaceId") spaceId: string,
    @Body(createTopicSchemaValidationPipe) body: CreateTopicRequestBody,
    @AuthenticationPrincipal() jwt: UserPayload,
    @Res() reply: FastifyReply,
  ) {
    const { sub } = jwt;
    const { name, emoji, shortDescription, description, slug } = body;

    const { topicId } = await this.topicsService.createTopic({
      name,
      emoji,
      shortDescription,
      description,
      slug,
      spaceId,
      userId: sub,
    });

    reply
      .status(HttpStatus.CREATED)
      .header("Location", `/v1/spaces/${spaceId}/topics/${topicId}`)
      .send({ topicId });
  }
}
