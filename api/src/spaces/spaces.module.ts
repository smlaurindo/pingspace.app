import { Module } from "@nestjs/common";
import { DrizzleModule } from "@/drizzle/drizzle.module";
import { SpacesController } from "./spaces.controller";
import { SpacesService } from "./spaces.service";
import { DrizzleORMRepositorySpaceMember } from "./repositories/impl/drizzle-orm-space-member.repository";
import { SpaceMemberRepository } from "./repositories/space-member.repository";
import { SpaceRepository } from "./repositories/space.repository";
import { DrizzleORMSpaceRepository } from "./repositories/impl/drizzle-orm-space.repository";
import { SpaceApiKeyRepository } from "./repositories/space-api-key.repository";
import { DrizzleORMSpaceApiKeyRepository } from "./repositories/impl/drizzle-orm-space-api-key.repository";
import { SpaceApiKeyGuard } from "./guards/space-api-key.guard";

@Module({
  imports: [DrizzleModule],
  controllers: [SpacesController],
  providers: [
    SpacesService,
    {
      provide: SpaceMemberRepository,
      useClass: DrizzleORMRepositorySpaceMember,
    },
    {
      provide: SpaceApiKeyRepository,
      useClass: DrizzleORMSpaceApiKeyRepository,
    },
    {
      provide: SpaceRepository,
      useClass: DrizzleORMSpaceRepository,
    },
    SpaceApiKeyGuard,
  ],
  exports: [SpaceMemberRepository, SpaceRepository, SpaceApiKeyRepository],
})
export class SpacesModule {}
