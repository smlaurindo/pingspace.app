import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from "@nestjs/common";
import type { FastifyReply } from "fastify";
import { TopicSlugAlreadyExistsException } from "./exceptions/topic-slug-already-exists.exception";
import { SpaceNotFoundException } from "@/spaces/exceptions/space-not-found.exception";
import { UnauthorizedSpaceAccessException } from "@/spaces/exceptions/unauthorized-space-access.exception";

type TopicException =
  | TopicSlugAlreadyExistsException
  | SpaceNotFoundException
  | UnauthorizedSpaceAccessException;

@Catch(
  TopicSlugAlreadyExistsException,
  SpaceNotFoundException,
  UnauthorizedSpaceAccessException,
)
export class TopicsExceptionFilter implements ExceptionFilter {
  catch(exception: TopicException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const reply = ctx.getResponse<FastifyReply>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;

    if (exception instanceof TopicSlugAlreadyExistsException) {
      status = HttpStatus.CONFLICT;
    } else if (exception instanceof SpaceNotFoundException) {
      status = HttpStatus.NOT_FOUND;
    } else if (exception instanceof UnauthorizedSpaceAccessException) {
      status = HttpStatus.FORBIDDEN;
    }

    reply.status(status).send({
      code: exception.code,
      message: exception.message,
      statusCode: status,
    });
  }
}
