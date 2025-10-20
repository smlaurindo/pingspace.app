import {
  type ExceptionFilter,
  Catch,
  type ArgumentsHost,
  HttpStatus,
} from "@nestjs/common";
import { ValidationException } from "../exceptions/validation-exception";
import type { FastifyReply } from "fastify";

@Catch(ValidationException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: ValidationException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const reply = ctx.getResponse<FastifyReply>();

    reply.status(HttpStatus.BAD_REQUEST).send({
      code: exception.code,
      message: exception.message,
      details: exception.details,
      errors: exception.errors,
    });
  }
}
