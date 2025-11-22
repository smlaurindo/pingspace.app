import { Module } from "@nestjs/common";
import { ClsModule } from "nestjs-cls";
import { ClsPluginTransactional } from "@nestjs-cls/transactional";
import { TransactionalAdapterDrizzleOrm } from "@nestjs-cls/transactional-adapter-drizzle-orm";
import { AuthModule } from "@/auth/auth.module";
import { DrizzleModule } from "@/drizzle/drizzle.module";
import { ConfigModule } from "@/config/config.module";
import { SpacesModule } from "@/spaces/spaces.module";
import { TopicsModule } from "@/spaces/topics/topics.module";
import { PingsModule } from "@/spaces/topics/pings/pings.module";
import { DrizzleAsyncProvider } from "@/drizzle/drizzle.provider";
import { ApiKeysModule } from "@/spaces/api-keys/api-keys.module";

@Module({
  imports: [
    ConfigModule.forRoot(),
    DrizzleModule,
    AuthModule,
    SpacesModule,
    TopicsModule,
    ApiKeysModule,
    PingsModule,
    ClsModule.forRoot({
      global: true,
      plugins: [
        new ClsPluginTransactional({
          imports: [DrizzleModule],
          adapter: new TransactionalAdapterDrizzleOrm({
            drizzleInstanceToken: DrizzleAsyncProvider,
          }),
        }),
      ],
    }),
  ],
})
export class AppModule {}
