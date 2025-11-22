import { Module } from "@nestjs/common";
import { DrizzleModule } from "@/drizzle/drizzle.module";
import { TopicsModule } from "@/topics/topics.module";
import { ApiKeysModule } from "@/api-keys/api-keys.module";
import { PingsController } from "./pings.controller";
import { PingsService } from "./pings.service";
import { PingRepository } from "./repositories/ping.repository";
import { DrizzleORMPingRepository } from "./repositories/impl/drizzle-orm-ping.repository";

@Module({
  imports: [DrizzleModule, TopicsModule, ApiKeysModule],
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
