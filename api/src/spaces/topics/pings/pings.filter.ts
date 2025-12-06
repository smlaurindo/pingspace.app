import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from "@nestjs/common";
import type { FastifyReply } from "fastify";
import { TopicSlugNotFoundException } from "../../exceptions/topic-slug-not-found.exception";
import { SpaceNotFoundException } from "../../exceptions/space-not-found.exception";
import { SpaceApiKeyNotFoundException } from "../../exceptions/space-api-key-not-found.exception";
import { UnauthorizedSpaceAccessException } from "../../exceptions/unauthorized-space-access.exception";
import { TopicNotFoundException } from "../../exceptions/topic-not-found.exception";

type PingException =
  | TopicSlugNotFoundException
  | SpaceNotFoundException
  | SpaceApiKeyNotFoundException
  | UnauthorizedSpaceAccessException
  | TopicNotFoundException;

@Catch(
  TopicSlugNotFoundException,
  SpaceNotFoundException,
  SpaceApiKeyNotFoundException,
  UnauthorizedSpaceAccessException,
  TopicNotFoundException,
)
export class PingsExceptionFilter implements ExceptionFilter {
  catch(exception: PingException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const reply = ctx.getResponse<FastifyReply>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;

    if (
      exception instanceof TopicSlugNotFoundException ||
      exception instanceof SpaceNotFoundException ||
      exception instanceof SpaceApiKeyNotFoundException ||
      exception instanceof TopicNotFoundException
    ) {
      statusCode = HttpStatus.NOT_FOUND;
    } else if (exception instanceof UnauthorizedSpaceAccessException) {
      statusCode = HttpStatus.FORBIDDEN;
    }

    reply.status(statusCode).send({
      code: exception.code,
      message: exception.message,
      details: exception.details,
      statusCode,
    });
  }
}
