import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from "@nestjs/common";
import type { FastifyReply } from "fastify";
import { SpaceSlugAlreadyExistsException } from "./exceptions/space-slug-already-exists.exception";
import { InsufficientSpacePermissionsException } from "./exceptions/insufficient-space-permissions.exception";
import { SpaceNotFoundException } from "./exceptions/space-not-found.exception";
import { UnauthorizedSpaceAccessException } from "./exceptions/unauthorized-space-access.exception";

type SpaceException =
  | SpaceSlugAlreadyExistsException
  | InsufficientSpacePermissionsException
  | SpaceNotFoundException
  | UnauthorizedSpaceAccessException;

@Catch(
  SpaceSlugAlreadyExistsException,
  InsufficientSpacePermissionsException,
  SpaceNotFoundException,
  UnauthorizedSpaceAccessException,
)
export class SpacesExceptionFilter implements ExceptionFilter {
  catch(exception: SpaceException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const reply = ctx.getResponse<FastifyReply>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;

    if (exception instanceof SpaceSlugAlreadyExistsException) {
      statusCode = HttpStatus.CONFLICT;
    } else if (exception instanceof SpaceNotFoundException) {
      statusCode = HttpStatus.NOT_FOUND;
    } else if (
      exception instanceof InsufficientSpacePermissionsException ||
      exception instanceof UnauthorizedSpaceAccessException
    ) {
      statusCode = HttpStatus.FORBIDDEN;
    }

    reply.status(statusCode).send({
      code: exception.code,
      message: exception.message,
      details: exception.details,
    });
  }
}
