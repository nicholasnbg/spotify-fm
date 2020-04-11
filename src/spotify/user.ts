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

  return T.map(E.flatten)(
    TE.tryCatch(
      () => axios.get("https://api.spotify.com/v1/me", config).then((res) => handleGetUserIdResponse(res)),
      (err) => Error("Problem getting current user" + err)
    )
  );
};

export const handleGetUserIdResponse = (res: any): E.Either<Error, UserId> => {
  const { data } = res;
  return data?.id
    ? E.right({
        value: data.id,
      })
    : E.left(Error("Could not retrieve user ID"));
};