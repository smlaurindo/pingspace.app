import { Body, Controller, HttpStatus, Post, Res } from "@nestjs/common";
import { z } from "zod";
import type { FastifyReply } from "fastify";
import { ZodValidationPipe } from "@/shared/pipes/zod-validation.pipe";
import { SpacesService } from "./spaces.service";
import { AuthenticationPrincipal } from "@/shared/decorators/authentication-principal.decorator";
import type { UserPayload } from "@/@types/user-jwt-payload";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const createSpaceSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name must be at most 50 characters"),
  description: z
    .string()
    .max(500, "Description must be at most 500 characters")
    .optional()
    .refine((val) => val?.trim()),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .max(40, "Slug must be at most 40 characters")
    .optional()
    .transform((val) =>
      val
        ? val
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")
        : undefined,
    )
    .refine(
      (val) => !val || slugRegex.test(val),
      "Slug must contain only lowercase letters, numbers, and hyphens (no leading/trailing hyphens)",
    ),
});

const createSpaceSchemaValidationPipe = new ZodValidationPipe(
  createSpaceSchema,
);

type CreateSpaceRequestBody = z.infer<typeof createSpaceSchema>;

@Controller()
export class SpacesController {
  public constructor(private readonly spacesService: SpacesService) {}

  @Post("/v1/spaces")
  async createSpace(
    @Body(createSpaceSchemaValidationPipe)
    body: CreateSpaceRequestBody,
    @AuthenticationPrincipal() jwt: UserPayload,
    @Res() reply: FastifyReply,
  ) {
    const { name, description } = body;
    const { sub } = jwt;

    const { spaceId } = await this.spacesService.createSpace({
      name,
      description,
      ownerId: sub,
    });

    reply
      .status(HttpStatus.CREATED)
      .header("Location", `/v1/spaces/${spaceId}`)
      .send();
  }
}
