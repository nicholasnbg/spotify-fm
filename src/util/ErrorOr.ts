interface ErrorOr<T> {
  errors: string[];
  value: T;
}
