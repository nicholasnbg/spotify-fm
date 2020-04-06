import { generateTopTracksEndpoint, transformTrack } from "./lastfm";
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

describe("transformTrack", () => {
  test("transforms raw track data", () => {
    const rawTrack: RawTrack = {
      artist: {
        "#text": "artistA",
        mbid: "someMbid"
      },
      "@attr": {
        rank: 5
      },
      image: [
        {
          "#text": "someimagelinksmall",
          size: "small"
        },
        {
        "#text": "someimagelinkmedium",
        size: "medium"
      }],
      name: "greatSong",
      playcount: 100
    }

    const result = transformTrack(rawTrack)
    const expected: LastFmTrack = { 
      artist: "artistA",
      image: "someimagelinkmedium",
      name: "greatSong",
      playcount: 100,
      rank: 5
    }

    expect(result).toStrictEqual(expected)
  })
})

