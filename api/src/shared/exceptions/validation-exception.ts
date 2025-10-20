import { BaseException } from "./base-exception";

export interface ValidationError {
  field: string;
  message: string;
}

export class ValidationException extends BaseException {
  public readonly code = "VALIDATION_ERROR";
  public readonly message = "Validation failed";
  public readonly details: string;
  public readonly errors: ValidationError[];

  public constructor(errors: ValidationError[]) {
    super("One or more validation errors occurred");
    this.details = "One or more validation errors occurred";
    this.errors = errors;
  }
}
