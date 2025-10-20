import { ZodError, z } from "zod";

import { ValidationException } from "../exceptions/validation-exception";
import { BadRequestException, PipeTransform } from "@nestjs/common";

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: z.ZodSchema) {}

  transform(value: unknown) {
    try {
      return this.schema.parse(value);
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((issue) => {
          return { message: issue.message, field: issue.path[0] as string };
        });

        throw new ValidationException(errors);
      }

      throw new BadRequestException("A validação falhou");
    }
  }
}
