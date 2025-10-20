import { Module } from "@nestjs/common";
import { AuthModule } from "@/auth/auth.module";
import { DrizzleModule } from "@/drizzle/drizzle.module";
import { ConfigModule } from "@/config/config.module";
import { SpacesModule } from "./spaces/spaces.module";

@Module({
  imports: [ConfigModule.forRoot(), DrizzleModule, AuthModule, SpacesModule],
})
export class AppModule {}
