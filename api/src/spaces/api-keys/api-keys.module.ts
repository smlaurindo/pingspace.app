import { Module } from "@nestjs/common";
import { DrizzleModule } from "@/drizzle/drizzle.module";
import { SpacesModule } from "../spaces.module";
import { ApiKeysController } from "./api-keys.controller";
import { ApiKeysService } from "./api-keys.service";
import { ApiKeyRepository } from "./repositories/api-key.repository";
import { DrizzleORMApiKeyRepository } from "./repositories/impl/drizzle-orm-api-key.repository";
import { ApiKeyGuard } from "./guards/api-key.guard";

@Module({
  imports: [DrizzleModule, SpacesModule],
  controllers: [ApiKeysController],
  providers: [
    ApiKeysService,
    {
      provide: ApiKeyRepository,
      useClass: DrizzleORMApiKeyRepository,
    },
    ApiKeyGuard,
  ],
  exports: [ApiKeyRepository],
})
export class ApiKeysModule {}
