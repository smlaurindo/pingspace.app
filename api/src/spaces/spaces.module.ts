import { Module } from "@nestjs/common";
import { CacheModule } from "@nestjs/cache-manager";
import { DrizzleModule } from "@/drizzle/drizzle.module";
import { SpacesController } from "./spaces.controller";
import { SpacesService } from "./spaces.service";
import { SpaceMemberGuard } from "./guards/space-member.guard";
import { DrizzleORMRepositorySpaceMembership } from "./repositories/impl/drizzle-orm-space-membership.repository";
import { SpaceMembershipRepository } from "./repositories/space-membership.repository";
import { SpaceRepository } from "./repositories/space.repository";
import { DrizzleORMSpaceRepository } from "./repositories/impl/drizzle-orm-space.repository";

@Module({
  imports: [
    DrizzleModule,
    CacheModule.register({
      ttl: 300000, // 5 minutes
      max: 1000, // maximum number of items in cache
    }),
  ],
  controllers: [SpacesController],
  providers: [
    SpacesService,
    SpaceMemberGuard,
    {
      provide: SpaceMembershipRepository,
      useClass: DrizzleORMRepositorySpaceMembership,
    },
    {
      provide: SpaceRepository,
      useClass: DrizzleORMSpaceRepository,
    },
  ],
  exports: [SpaceMemberGuard, SpaceMembershipRepository, SpaceRepository],
})
export class SpacesModule {}
