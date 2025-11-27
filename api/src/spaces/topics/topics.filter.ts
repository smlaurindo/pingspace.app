import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from "@nestjs/common";
import type { FastifyReply } from "fastify";
import { TopicSlugAlreadyExistsException } from "./exceptions/topic-slug-already-exists.exception";
import { SpaceNotFoundException } from "../exceptions/space-not-found.exception";
import { UnauthorizedSpaceAccessException } from "../exceptions/unauthorized-space-access.exception";
import { TopicSlugNotFoundException } from "../exceptions/topic-slug-not-found.exception";
import { TopicNotFoundException } from "../exceptions/topic-not-found.exception";

type TopicException =
  | TopicSlugAlreadyExistsException
  | SpaceNotFoundException
  | UnauthorizedSpaceAccessException
  | TopicSlugNotFoundException
  | TopicNotFoundException;

@Catch(
  TopicSlugAlreadyExistsException,
  SpaceNotFoundException,
  UnauthorizedSpaceAccessException,
  TopicSlugNotFoundException,
  TopicNotFoundException,
)
export class TopicsExceptionFilter implements ExceptionFilter {
  catch(exception: TopicException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const reply = ctx.getResponse<FastifyReply>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;

    if (exception instanceof TopicSlugAlreadyExistsException) {
      statusCode = HttpStatus.CONFLICT;
    } else if (
      exception instanceof SpaceNotFoundException ||
      exception instanceof TopicSlugNotFoundException ||
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
