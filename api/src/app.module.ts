import { Module } from "@nestjs/common";
import { ClsModule } from "nestjs-cls";
import { ClsPluginTransactional } from "@nestjs-cls/transactional";
import { TransactionalAdapterDrizzleOrm } from "@nestjs-cls/transactional-adapter-drizzle-orm";
import { AuthModule } from "@/auth/auth.module";
import { DrizzleModule } from "@/drizzle/drizzle.module";
import { ConfigModule } from "@/config/config.module";
import { SpacesModule } from "@/spaces/spaces.module";
import { TopicsModule } from "@/topics/topics.module";
import { DrizzleAsyncProvider } from "@/drizzle/drizzle.provider";

@Module({
  imports: [
    ConfigModule.forRoot(),
    DrizzleModule,
    AuthModule,
    SpacesModule,
    TopicsModule,
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
