import { requestTokens } from "./spotify";
import { handleTokenResponse } from "./fetchTokens";
import { Tokens } from "./types";

describe("requestTokens", () => {
  test("when succesfully retrieves tokens", async () => {
    const expectedTokens = {
      access_token: "atoken",
      refresh_token: "rtoken",
      scope: "ascope",
    };

    const fetch = (s: string, o: object): Promise<Tokens> => {
      const tokenResponse: Tokens = {
        access_token: "atoken",
        refresh_token: "rtoken",
        scope: "ascope",
      };
      return Promise.resolve(tokenResponse);
    };

    const result = await requestTokens("someAuth", fetch);

    expect(result).toEqual(expectedTokens);
  });

  test("when fails to retrieve tokens", async () => {
    const fetch = (s: string, o: object): Promise<Tokens> => {
      return Promise.reject(Error("Failed to fetch tokens"));
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

    const response = {
      data: expectedTokens,
    };

    const result = handleTokenResponse(JSON.stringify(response), {});

    expect(result).toEqual(expectedTokens);
  });

  test("invalid response", () => {
    const response = {}
    const result = handleTokenResponse(JSON.stringify(response), {});

    expect(result).toEqual(Error("Couldn't parse tokens response"))
  })
});
