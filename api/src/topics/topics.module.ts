import { Module } from "@nestjs/common";
import { TopicsController } from "./topics.controller";
import { TopicsService } from "./topics.service";
import { DrizzleModule } from "@/drizzle/drizzle.module";
import { SpacesModule } from "@/spaces/spaces.module";
import { TopicRepository } from "./repositories/topic.repository";
import { DrizzleORMTopicRepository } from "./repositories/impl/drizzle-orm-topic.repository";

@Module({
  imports: [DrizzleModule, SpacesModule],
  controllers: [TopicsController],
  providers: [
    TopicsService,
    {
      provide: TopicRepository,
      useClass: DrizzleORMTopicRepository,
    },
  ],
  exports: [TopicRepository],
})
export class TopicsModule {}
