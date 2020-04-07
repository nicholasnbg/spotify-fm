import { Either } from 'monet';
export type ErrorOr<T> = Either<Error, T>
