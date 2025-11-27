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

  app.use((req, res, next) => {
    console.log(`[${req.method}] ${req.url}`);
    next();
  });

  const { CORS_ORIGIN, PORT } = process.env;

  app.enableCors({
    origin: CORS_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  });

  await app.register(fastifyCookie);

  app.useGlobalFilters(new ValidationExceptionFilter());

  await app.listen(PORT || 3000);
}

void bootstrap();
