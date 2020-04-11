import * as E from 'fp-ts/lib/Either'
import * as T from 'fp-ts/lib/Task'
import * as A from 'fp-ts/lib/Array'


export const seqEitherTask = E.either.sequence(T.task);
export const seqArrayTask = A.array.sequence(T.task);
export const traverseEither = E.either.traverse(T.task)
export const traverseArrayTask = A.array.traverse(T.task)