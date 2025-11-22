import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from "@nestjs/common";
import type { FastifyReply } from "fastify";
import { TopicNotFoundException } from "./exceptions/topic-not-found.exception";

type PingException = TopicNotFoundException;

@Catch(TopicNotFoundException)
export class PingsExceptionFilter implements ExceptionFilter {
  catch(exception: PingException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const reply = ctx.getResponse<FastifyReply>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;

    if (exception instanceof TopicNotFoundException) {
      status = HttpStatus.NOT_FOUND;
    }

    reply.status(status).send({
      code: exception.code,
      message: exception.message,
      statusCode: status,
    });
  }
}
