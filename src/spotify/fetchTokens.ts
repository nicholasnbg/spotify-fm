import { Either, right, left, flatten } from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";
import * as T from "fp-ts/lib/Task";

import axios from "axios";
import qs from "qs";
import { Tokens } from "./types";

const fetchTokens = (tokenEndpoint: string, data: object): T.Task<Either<Error, Tokens>> => {
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
  };

  const config = {
    headers,
  };

  return T.map(flatten)(
    TE.tryCatch(
      () => axios.post(tokenEndpoint, qs.stringify(data), config).then(handleTokenResponse),
      (err) => new Error("Couldn't parse tokens reponse")
    )
  );
};

const handleTokenResponse = (res: any): Either<Error, Tokens> => {
  const { data } = res;
  const accessToken = data?.access_token;
  console.log(accessToken);
  return data?.access_token
    ? right({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        scope: data.scope,
      })
    : left(Error("Couldn't parse tokens response"));
};

export { fetchTokens, handleTokenResponse };
