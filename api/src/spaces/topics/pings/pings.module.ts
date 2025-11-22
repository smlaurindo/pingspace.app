import { Module } from "@nestjs/common";
import { DrizzleModule } from "@/drizzle/drizzle.module";
import { TopicsModule } from "../topics.module";
import { SpacesModule } from "../../spaces.module";
import { PingsController } from "./pings.controller";
import { PingsService } from "./pings.service";
import { PingRepository } from "./repositories/ping.repository";
import { DrizzleORMPingRepository } from "./repositories/impl/drizzle-orm-ping.repository";

@Module({
  imports: [DrizzleModule, TopicsModule, SpacesModule],
  controllers: [PingsController],
  providers: [
    PingsService,
    {
      provide: PingRepository,
      useClass: DrizzleORMPingRepository,
    },
  ],
})
export class PingsModule {}
