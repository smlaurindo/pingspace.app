import { Module } from "@nestjs/common";
import { SpacesController } from "./spaces.controller";
import { SpacesService } from "./spaces.service";
import { DrizzleModule } from "@/drizzle/drizzle.module";

@Module({
  imports: [DrizzleModule],
  controllers: [SpacesController],
  providers: [SpacesService],
})
export class SpacesModule {}
