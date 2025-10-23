import {
  DrizzleAsyncProvider,
  type DrizzleDatabase,
} from "@/drizzle/drizzle.provider";
import { Inject, Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import type { CreateSpaceRequest, CreateSpaceResponse } from "./spaces.dto";
import { spaceMembers, spaces } from "./spaces.schema";
import { SpaceSlugAlreadyExistsException } from "./exceptions/space-slug-already-exists.exception";

@Injectable()
export class SpacesService {
  public constructor(
    @Inject(DrizzleAsyncProvider)
    private readonly db: DrizzleDatabase,
  ) {}

  async createSpace(request: CreateSpaceRequest): Promise<CreateSpaceResponse> {
    const { name, shortDescription, description, slug, ownerId } = request;

    const finalSlug =
      slug ||
      name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    const existingSpace = await this.db
      .select({ id: spaces.id })
      .from(spaces)
      .where(eq(spaces.slug, finalSlug))
      .limit(1);

    if (existingSpace.length > 0) {
      throw new SpaceSlugAlreadyExistsException(finalSlug);
    }

    const { spaceId } = await this.db.transaction(async (tx) => {
      const [{ spaceId }] = await tx
        .insert(spaces)
        .values({
          name,
          slug: finalSlug,
          shortDescription,
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
