import { z } from "zod";
import { BadRequestException, PipeTransform } from "@nestjs/common";

export class ZodCUIDParameterValidationPipe implements PipeTransform {
  constructor(private readonly parameterName: string) {}

  transform(value: unknown) {
    try {
      return z.cuid2().parse(value);
    } catch {
      throw new BadRequestException(
        `Parameter ${this.parameterName} is invalid`,
      );
    }
  }
}
