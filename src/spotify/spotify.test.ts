import { Either, left, right } from "fp-ts/lib/Either";
import { Task } from "fp-ts/lib/Task";
import { handleTokenResponse } from "./fetchTokens";
import { handleGetUserIdResponse, requestTokens } from "./spotify";
import { Tokens } from "./types";

describe("requestTokens", () => {
  test("when succesfully retrieves tokens", async () => {
    const expectedTokens = {
      access_token: "atoken",
      refresh_token: "rtoken",
      scope: "ascope",
    };

    const fetch = (s: string, o: object): Task<Either<Error, Tokens>> => {
      const tokenResponse: Tokens = {
        access_token: "atoken",
        refresh_token: "rtoken",
        scope: "ascope",
      };
      return () => Promise.resolve(right(tokenResponse));
    };

    requestTokens("someAuth", fetch)().then((result) => {
      expect(result).toEqual(right(expectedTokens));
    });
  });

  test("when fails to retrieve tokens", async () => {
    const fetch = (s: string, o: object): Task<Either<Error, Tokens>> => {
      const a = Promise.resolve(left(Error("Failed to fetch tokens")));
      return () => a;
    };

    requestTokens("someAuth", fetch)().then((result) => {
      expect(result).toEqual(left(Error("Failed to fetch tokens")));
    });
  });
});

describe("handleTokenResponse", () => {
  test("valid response", () => {
    const expectedTokens = {
      access_token: "someAccessToken",
      refresh_token: "someRefreshToken",
      scope: "someScope",
    };

    const data = {
      data: expectedTokens,
    };

    const result = handleTokenResponse(data);

    expect(result).toEqual(right(expectedTokens));
  });

  test("invalid response", () => {
    const response = {};
    const result = handleTokenResponse(JSON.stringify({ data: response }));

    expect(result).toEqual(left(Error("Couldn't parse tokens response")));
  });
});

describe("handleGetUserIdResponse", () => {
  test("for valid reponse", () => {
    const expectedId = "12345";

    const response = {
      data: {
        id: expectedId,
      },
    };

    const result = handleGetUserIdResponse(response);

    expect(result).toEqual(right({ value: expectedId }));
  });

  test("for invalid response", () => {
    const result = handleGetUserIdResponse({});

    expect(result).toEqual(left(Error("Could not retrieve user ID")));
  });
});
