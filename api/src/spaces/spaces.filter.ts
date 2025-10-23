import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from "@nestjs/common";
import type { FastifyReply } from "fastify";
import { SpaceSlugAlreadyExistsException } from "./exceptions/space-slug-already-exists.exception";

@Catch(SpaceSlugAlreadyExistsException)
export class SpacesExceptionFilter implements ExceptionFilter {
  catch(exception: SpaceSlugAlreadyExistsException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const reply = ctx.getResponse<FastifyReply>();

    reply.status(HttpStatus.CONFLICT).send({
      code: exception.code,
      message: exception.message,
      details: exception.details,
    });
  }
}
