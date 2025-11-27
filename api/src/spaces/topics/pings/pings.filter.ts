import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from "@nestjs/common";
import type { FastifyReply } from "fastify";
import { TopicSlugNotFoundException } from "../../exceptions/topic-slug-not-found.exception";

type PingException = TopicSlugNotFoundException;

@Catch(TopicSlugNotFoundException)
export class PingsExceptionFilter implements ExceptionFilter {
  catch(exception: PingException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const reply = ctx.getResponse<FastifyReply>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;

    if (exception instanceof TopicSlugNotFoundException) {
      statusCode = HttpStatus.NOT_FOUND;
    }

    reply.status(statusCode).send({
      code: exception.code,
      message: exception.message,
      details: exception.details,
      statusCode,
    });
  }
}
