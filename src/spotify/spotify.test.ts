import { Right, Either } from "monet";
import { Left } from "monet";
import { requestTokens, handleGetUserIdResponse } from "./spotify";
import { handleTokenResponse } from "./fetchTokens";
import { Tokens } from "./types";

describe("requestTokens", () => {
  test("when succesfully retrieves tokens", async () => {
    const expectedTokens = {
      access_token: "atoken",
      refresh_token: "rtoken",
      scope: "ascope",
    };

    const fetch = (s: string, o: object): Promise<Either<Error, Tokens>> => {
      const tokenResponse: Tokens = {
        access_token: "atoken",
        refresh_token: "rtoken",
        scope: "ascope",
      };
      return Promise.resolve(Right(tokenResponse));
    };

    const result = await requestTokens("someAuth", fetch);

    expect(result).toEqual(expectedTokens);
  });

  test("when fails to retrieve tokens", async () => {
    const fetch = (s: string, o: object): Promise<Either<Error, Tokens>> => {
      return Promise.reject(Left(Error("Failed to fetch tokens")));
    };

    await requestTokens("someAuth", fetch).catch((err) => {
      expect(err.message).toEqual("Failed to fetch tokens");
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

    const result = handleTokenResponse(JSON.stringify(expectedTokens), {});

    expect(result).toEqual(Right(expectedTokens));
  });

  test("invalid response", () => {
    const response = {};
    const result = handleTokenResponse(JSON.stringify(response), {});

    expect(result).toEqual(Left(Error("Couldn't parse tokens response")));
  });
});

describe("handleUserIdResponse", () => {
  test("for valid reponse", () => {
    const expectedId = "12345";

    const response = {
      id: expectedId,
    };

    const result = handleGetUserIdResponse(JSON.stringify(response), {});

    expect(result).toEqual({ value: expectedId });
  });

  test("for invalid response", () => {
    const response = {};
    const result = handleGetUserIdResponse(JSON.stringify(response), {});

    expect(result).toEqual(Error("Could not retrieve user ID"));
  });
});
