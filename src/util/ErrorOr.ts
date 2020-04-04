interface ErrorOr<T> {
  errors?: string[];
  value?: T;
}

interface Right<T> extends ErrorOr<T> {
  value: T
}

interface Left extends ErrorOr<any> {
  errors: string[];
}
