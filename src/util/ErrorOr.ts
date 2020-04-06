export type ErrorOr<T> = T | Error

export function isError<T>(arg: ErrorOr<T>): arg is Error {
  return arg instanceof Error;
}

export function isSuccess<T>(arg: ErrorOr<T>): arg is T {
  return !isError(arg);
}