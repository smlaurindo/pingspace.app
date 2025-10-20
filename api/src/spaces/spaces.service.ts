import { ConfigService } from "@/config/config.service";
import {
  DrizzleAsyncProvider,
  type DrizzleDatabase,
} from "@/drizzle/drizzle.provider";
import { Inject } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { CreateSpaceRequest, CreateSpaceResponse } from "./spaces.dto";
import { spaceMembers, spaces } from "./spaces.schema";

export class SpacesService {
  public constructor(
    @Inject(DrizzleAsyncProvider)
    private readonly db: DrizzleDatabase,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async createSpace(request: CreateSpaceRequest): Promise<CreateSpaceResponse> {
    const { name, description, ownerId } = request;

    const { spaceId } = await this.db.transaction(async (tx) => {
      const [{ spaceId }] = await tx
        .insert(spaces)
        .values({
          name,
          description,
          ownerId,
        })
        .returning({ spaceId: spaces.id });

      await tx.insert(spaceMembers).values({
        spaceId,
        memberId: ownerId,
        role: "OWNER",
      });

      return { spaceId };
    });

    return { spaceId };
  }
}
