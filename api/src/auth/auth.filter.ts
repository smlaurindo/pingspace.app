import {
  type ExceptionFilter,
  Catch,
  type ArgumentsHost,
  HttpStatus,
} from "@nestjs/common";
import { UserAlreadyExistsException } from "./exceptions/user-already-exists.exception";
import { InvalidCredentialsException } from "./exceptions/invalid-credentials.exception";
import type { FastifyReply } from "fastify";

@Catch(InvalidCredentialsException, UserAlreadyExistsException)
export class AuthExceptionFilter implements ExceptionFilter {
  catch(
    exception: InvalidCredentialsException | UserAlreadyExistsException,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const reply = ctx.getResponse<FastifyReply>();

    switch (exception.constructor) {
      case InvalidCredentialsException: {
        return reply.status(HttpStatus.UNAUTHORIZED).send({
          code: exception.code,
          message: exception.message,
          details: exception.details,
        });
      }
      case UserAlreadyExistsException: {
        return reply.status(HttpStatus.CONFLICT).send({
          code: exception.code,
          message: exception.message,
          details: exception.details,
        });
      }
    }

    return reply.status(500).send({ message: "Internal server error" });
  }
}
