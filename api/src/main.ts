import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import {
  FastifyAdapter,
  type NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { fastifyCookie } from "@fastify/cookie";
import { ValidationExceptionFilter } from "@/shared/filters/validation.filter";

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  const { CORS_ORIGIN, PORT } = process.env;

  app.enableCors({ origin: CORS_ORIGIN, credentials: true });

  await app.register(fastifyCookie);

  app.useGlobalFilters(new ValidationExceptionFilter());

  await app.listen(PORT || 3000);
}

void bootstrap();
