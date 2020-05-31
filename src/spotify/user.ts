import { pipe } from 'fp-ts/lib/pipeable';
import axios from 'axios';
import * as E from "fp-ts/lib/Either";
import * as T from "fp-ts/lib/Task";
import * as TE from "fp-ts/lib/TaskEither";
import { UserId } from "./types";

export const getCurrentUserId = (authCode: string): T.Task<E.Either<Error, UserId>> => {
  const headers = {
    Authorization: `Bearer ${authCode}`,
  };

  const config = {
    headers,
  };

  const errorOrResponseTask = TE.tryCatch(
      () => axios.get("https://api.spotify.com/v1/me", config).then((res) => handleGetUserIdResponse(res)),
      (err) => Error("Problem getting current user" + err)
    )

    return pipe(
      errorOrResponseTask,
      T.map((errorOrResp) => E.chain(handleGetUserIdResponse)(errorOrResp))
    )
};

export const handleGetUserIdResponse = (res: any): E.Either<Error, UserId> => {
  const { data } = res;
  return data?.id
    ? E.right({
        value: data.id,
      })
    : E.left(Error("Could not retrieve user ID"));
};