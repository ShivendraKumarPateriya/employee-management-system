export class HttpError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export function assertFound<T>(value: T | null | undefined, message = "Not found"): T {
  if (!value) throw new HttpError(404, message);
  return value;
}
