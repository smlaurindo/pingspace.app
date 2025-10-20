export abstract class BaseException extends Error {
  abstract readonly code: string;
  abstract override readonly message: string;
  abstract details: string;
}
