import { generateTopTracksEndpoint } from "./lastfm";
import moment from "moment";

describe("generateTopTracksEndpoint", () => {
  test("with complete inputs", () => {
    const start = moment("2020-01-01").startOf("D");
    const end = moment("2020-01-10").endOf("D");
    const result = generateTopTracksEndpoint(
      "userA",
      start,
      end,
      "testKey"
    );

    expect(result).toBe(
      `?method=user.getweeklytrackchart&user=userA&api_key=testKey&format=json&from=1577797200&to=1578661199`
    );
  });
});
