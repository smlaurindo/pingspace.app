import { z } from "zod";
import { BadRequestException, PipeTransform } from "@nestjs/common";

export class ZodUUIDParameterValidationPipe implements PipeTransform {
  constructor(private readonly parameterName: string) {}

  transform(value: unknown) {
    try {
      return z.uuidv7().parse(value);
    } catch {
      throw new BadRequestException(
        `Parameter ${this.parameterName} is invalid`,
      );
    }
  }
}
