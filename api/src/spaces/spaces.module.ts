import { Module } from "@nestjs/common";
import { DrizzleModule } from "@/drizzle/drizzle.module";
import { SpacesController } from "./spaces.controller";
import { SpacesService } from "./spaces.service";
import { DrizzleORMRepositorySpaceMembership } from "./repositories/impl/drizzle-orm-space-membership.repository";
import { SpaceMembershipRepository } from "./repositories/space-membership.repository";
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
      provide: SpaceMembershipRepository,
      useClass: DrizzleORMRepositorySpaceMembership,
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
  exports: [SpaceMembershipRepository, SpaceRepository, SpaceApiKeyRepository],
})
export class SpacesModule {}
