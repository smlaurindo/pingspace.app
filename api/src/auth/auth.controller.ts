import { Controller, Post, Body, Res, UseFilters } from "@nestjs/common";
import { ZodValidationPipe } from "@/shared/pipes/zod-validation.pipe";
import type { FastifyReply } from "fastify";
import { z } from "zod";
import { AuthService } from "./auth.service";
import type { SignInHttpRequest } from "./auth.dto";
import { AuthExceptionFilter } from "./auth.filter";
import { SkipAuth } from "@/shared/decorators/skip-auth.decorator";

const signUpSchema = z.object({
  email: z.email({ message: "Invalid email" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
      "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, and one number",
    ),
});

const signUpSchemaValidationPipe = new ZodValidationPipe(signUpSchema);

type SignUpRequestBody = z.infer<typeof signUpSchema>;

@Controller()
@UseFilters(AuthExceptionFilter)
export class AuthController {
  public constructor(private readonly authService: AuthService) {}

  @SkipAuth()
  @Post("/v1/auth/sign-up")
  async signUp(
    @Body(signUpSchemaValidationPipe) body: SignUpRequestBody,
    @Res() reply: FastifyReply,
  ) {
    const { accessToken } = await this.authService.signUp(body);

    reply.setCookie("access_token", accessToken, {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 60 * 60 * 24,
    });

    reply.status(201).send();
  }

  @SkipAuth()
  @Post("/v1/auth/sign-in")
  async signIn(@Body() body: SignInHttpRequest, @Res() reply: FastifyReply) {
    const { accessToken } = await this.authService.signIn(body);

    reply.setCookie("access_token", accessToken, {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 60 * 60 * 24,
    });

    reply.status(200).send();
  }
}
