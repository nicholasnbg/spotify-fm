import { Right } from 'monet';
import { handleSearchTrackResponse } from './tracks';

describe("handleSearchTrackResponse", () => {
  test("handles valid search response with items > 0", () => {

    const response = JSON.stringify({
      "tracks" : {
        "href" : "https://api.spotify.com/v1/search?query=Atreyu+Right+Side+of+the+Bed&type=track&offset=0&limit=1",
        "items" : [ {
          "album" : {
            "album_type" : "album",
            "artists" : [ {
              "external_urls" : {
                "spotify" : "https://open.spotify.com/artist/3LkSiHbjqOHCKCqBfEZOTv"
              },
              "href" : "https://api.spotify.com/v1/artists/3LkSiHbjqOHCKCqBfEZOTv",
              "id" : "3LkSiHbjqOHCKCqBfEZOTv",
              "name" : "Atreyu",
              "type" : "artist",
              "uri" : "spotify:artist:3LkSiHbjqOHCKCqBfEZOTv"
            } ],
            "available_markets" : [ "AD", "AE", "AR", "AT", "AU", "BE", "BG", "BH", "BO", "BR", "CA", "CH", "CL", "CO", "CR", "CY", "CZ", "DE", "DK", "DO", "DZ", "EC", "EE", "EG", "ES", "FI", "FR", "GB", "GR", "GT", "HK", "HN", "HU", "ID", "IE", "IL", "IN", "IS", "IT", "JO", "JP", "KW", "LB", "LI", "LT", "LU", "LV", "MA", "MC", "MT", "MX", "MY", "NI", "NL", "NO", "NZ", "OM", "PA", "PE", "PH", "PL", "PS", "PT", "PY", "QA", "RO", "SA", "SE", "SG", "SK", "SV", "TH", "TN", "TR", "TW", "US", "UY", "VN", "ZA" ],
            "external_urls" : {
              "spotify" : "https://open.spotify.com/album/52kEF3wvknVbIAk28VStyL"
            },
            "href" : "https://api.spotify.com/v1/albums/52kEF3wvknVbIAk28VStyL",
            "id" : "52kEF3wvknVbIAk28VStyL",
            "images" : [ {
              "height" : 640,
              "url" : "https://i.scdn.co/image/ab67616d0000b273d3129712ceff55a3278ccb6a",
              "width" : 640
            }, {
              "height" : 300,
              "url" : "https://i.scdn.co/image/ab67616d00001e02d3129712ceff55a3278ccb6a",
              "width" : 300
            }, {
              "height" : 64,
              "url" : "https://i.scdn.co/image/ab67616d00004851d3129712ceff55a3278ccb6a",
              "width" : 64
            } ],
            "name" : "The Curse (Deluxe Edition)",
            "release_date" : "2004-06-28",
            "release_date_precision" : "day",
            "total_tracks" : 14,
            "type" : "album",
            "uri" : "spotify:album:52kEF3wvknVbIAk28VStyL"
          },
          "artists" : [ {
            "external_urls" : {
              "spotify" : "https://open.spotify.com/artist/3LkSiHbjqOHCKCqBfEZOTv"
            },
            "href" : "https://api.spotify.com/v1/artists/3LkSiHbjqOHCKCqBfEZOTv",
            "id" : "3LkSiHbjqOHCKCqBfEZOTv",
            "name" : "Atreyu",
            "type" : "artist",
            "uri" : "spotify:artist:3LkSiHbjqOHCKCqBfEZOTv"
          } ],
          "available_markets" : [ "AD", "AE", "AR", "AT", "AU", "BE", "BG", "BH", "BO", "BR", "CA", "CH", "CL", "CO", "CR", "CY", "CZ", "DE", "DK", "DO", "DZ", "EC", "EE", "EG", "ES", "FI", "FR", "GB", "GR", "GT", "HK", "HN", "HU", "ID", "IE", "IL", "IN", "IS", "IT", "JO", "JP", "KW", "LB", "LI", "LT", "LU", "LV", "MA", "MC", "MT", "MX", "MY", "NI", "NL", "NO", "NZ", "OM", "PA", "PE", "PH", "PL", "PS", "PT", "PY", "QA", "RO", "SA", "SE", "SG", "SK", "SV", "TH", "TN", "TR", "TW", "US", "UY", "VN", "ZA" ],
          "disc_number" : 1,
          "duration_ms" : 222466,
          "explicit" : false,
          "external_ids" : {
            "isrc" : "USVIC0421803"
          },
          "external_urls" : {
            "spotify" : "https://open.spotify.com/track/2cxbNLOKc9CtQ7hcH88ma3"
          },
          "href" : "https://api.spotify.com/v1/tracks/2cxbNLOKc9CtQ7hcH88ma3",
          "id" : "2cxbNLOKc9CtQ7hcH88ma3",
          "is_local" : false,
          "name" : "Right Side Of The Bed",
          "popularity" : 54,
          "preview_url" : null,
          "track_number" : 3,
          "type" : "track",
          "uri" : "spotify:track:2cxbNLOKc9CtQ7hcH88ma3"
        } ],
        "limit" : 1,
        "next" : "https://api.spotify.com/v1/search?query=Atreyu+Right+Side+of+the+Bed&type=track&offset=1&limit=1",
        "offset" : 0,
        "previous" : null,
        "total" : 6
      }
    })

    const result = handleSearchTrackResponse(response, {})

    expect(result).toEqual(Right({
      name: "Right Side Of The Bed",
      artist: "Atreyu",
      album: "The Curse (Deluxe Edition)",
      id: "2cxbNLOKc9CtQ7hcH88ma3",
      uri: "spotify:track:2cxbNLOKc9CtQ7hcH88ma3"
    }))

  })
})