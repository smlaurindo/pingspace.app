import { Module } from "@nestjs/common";
import { DrizzleModule } from "@/drizzle/drizzle.module";
import { SpacesController } from "./spaces.controller";
import { SpacesService } from "./spaces.service";
import { DrizzleORMRepositorySpaceMembership } from "./repositories/impl/drizzle-orm-space-membership.repository";
import { SpaceMembershipRepository } from "./repositories/space-membership.repository";
import { SpaceRepository } from "./repositories/space.repository";
import { DrizzleORMSpaceRepository } from "./repositories/impl/drizzle-orm-space.repository";

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
      provide: SpaceRepository,
      useClass: DrizzleORMSpaceRepository,
    },
  ],
  exports: [SpaceMembershipRepository, SpaceRepository],
})
export class SpacesModule {}
