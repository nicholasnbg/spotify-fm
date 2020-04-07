// import { Left, Right } from 'monet';
// import axios from 'axios';
// import { ErrorOr } from './../util/ErrorOr';
// import { SpotifyTrack, SearchResponse, RawTrackData } from './types';
// import rateLimit from "axios-rate-limit";
// import qs from 'qs';


// const rateLimitConfig = {
//   maxRequests: 30,
//   perMilliseconds: 3500,
// };
// const rateLimitHttpClient = rateLimit(axios.create(), rateLimitConfig);

// export const searchTrack = (authCode: string, track: LastFmTrack): Promise<ErrorOr<SpotifyTrack>> => {

//   const queryParams = {
//     q: `${track.name} ${track.artist}`,
//     type: "track",
//     limit: "1",
//   };

//   const endpoint = `https://api.spotify.com/v1/search?${qs.stringify(queryParams)}`

//   const headers =  {
//     Authorization: `Bearer ${authCode}`
//   }

//   const config = {
//     headers,
//     transformResponse: 
//   }
//   // const result = rateLimitHttpClient({
//   //   method: "get",
//   //   url: `https://api.spotify.com/v1/search?${qs.stringify(queryParams)}`,
//   //   headers: {
//   //     Authorization: `Bearer ${authCode}`,
//   //   },
//   // })

//   const result =rateLimitHttpClient.get(endpoint, )

//     .then((res) => {
//       const searchResponse: SearchResponse = JSON.parse(JSON.stringify(res.data.tracks));
//       // const trackData: RawTrackData = !(searchResponse.total === 0) ? searchResponse.items[0] : null;
//       let trackData: RawTrackData = null;
//       if (!(searchResponse.total === 0)) {
//         console.log("We got a response");
//         trackData = searchResponse.items[0];
//       }

//       let validTrack: SpotifyTrack | null = null;
//       if (trackData && trackData.uri) {
//         const spotifyTrack: SpotifyTrack = {
//           name: trackData.name,
//           artist: trackData.artists[0]?.name,
//           album: trackData.album.name,
//           id: trackData.id,
//           uri: trackData.uri,
//         };
//         validTrack = spotifyTrack;
//       }

//       if (validTrack) {
//         return validTrack;
//       } else {
//         return null;
//       }
//     })
//     .catch((err) => {
//       throw new Error("Error searching for track:" + err);
//     });

//   return result;
// };

// export const handleSearchTrackResponse = (res: any, headers: any): ErrorOr<SpotifyTrack> => {
//   const {data} = JSON.parse(res);
//   const searchItems: SearchResponse = data?.tracks
//   if(data && searchItems.items && (searchItems.total > 0)) {
//     return transformTrack(data.tracks.items[0])
//   } else {
//     return Left(Error("Coudln't parse track response"))
//   }
// }

// const transformTrack = (rawTrack: any): ErrorOr<SpotifyTrack> => {
//  if (rawTrack.name && rawTrack.artists[0]?.name && rawTrack.album?.name && rawTrack.id && rawTrack.uri) {
//    return Right({
//      name: rawTrack.name,
//      artist: rawTrack.artists[0].name,
//      album: rawTrack.album.name,
//      id: rawTrack.id,
//      uri: rawTrack.uri
//    })
//  } else {
//    return Left(Error("Could not transform track"))
//  }
// }