import { ErrorOr } from "./../util/ErrorOr";
import {Left, Right} from "monet"
import axios from "axios";
import qs from "qs";
import { Tokens } from "./types";

const fetchTokens = (tokenEndpoint: string, data: object): Promise<ErrorOr<Tokens>> => {
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
  };

  const config = {
    headers,
    transformResponse: handleTokenResponse,
  };

  return axios.post(tokenEndpoint, qs.stringify(data), config);
};

const handleTokenResponse = (res: any, headers: any): ErrorOr<Tokens> => {
  const { data } = JSON.parse(res);
  if (data) {
    const { access_token, refresh_token, scope } = data;
    return Right({
      access_token,
      refresh_token,
      scope,
    });
  } else {
    return Left(Error("Couldn't parse tokens response"));
  }
};

export { fetchTokens, handleTokenResponse };
