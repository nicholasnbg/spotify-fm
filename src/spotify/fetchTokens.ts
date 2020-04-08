import { Either, right, left } from 'fp-ts/lib/Either';
import axios from "axios";
import qs from "qs";
import { Tokens } from "./types";

const fetchTokens = (tokenEndpoint: string, data: object): Promise<Either<Error, Tokens>> => {
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
  };

  const config = {
    headers
  };

  return axios.post(tokenEndpoint, qs.stringify(data), config)
    .then(res => handleTokenResponse(res));
};

const handleTokenResponse = (res: any): Either<Error, Tokens> => {
  const {data} = res
  let result = null;
  if (data?.access_token) {
    console.log(data.access_token)
    result =  right({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      scope: data.scope
    });
  } else {
    result =  left(Error("Couldn't parse tokens response"));
  }

  return result
};

export { fetchTokens, handleTokenResponse };
