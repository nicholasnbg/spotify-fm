import { Left, Right, Either } from 'monet';
import axios from 'axios';
import { SpotifyTrack, SearchResponse, RawTrackData } from './types';
import rateLimit from "axios-rate-limit";
import qs from 'qs';


const rateLimitConfig = {
  maxRequests: 30,
  perMilliseconds: 3500,
};
const rateLimitHttpClient = rateLimit(axios.create(), rateLimitConfig);

export const searchTrack = (authCode: string, track: LastFmTrack): Promise<Either<Error, SpotifyTrack>> => {

  const queryParams = {
    q: `${track.name} ${track.artist}`,
    type: "track",
    limit: "1",
  };

  const endpoint = `https://api.spotify.com/v1/search?${qs.stringify(queryParams)}`

  const headers =  {
    Authorization: `Bearer ${authCode}`
  }

  const config = {
    headers,
    transformResponse: handleSearchTrackResponse
  }

 return rateLimitHttpClient.get(endpoint, config)
}

export const handleSearchTrackResponse = (data: any, headers: any): Either<Error, SpotifyTrack> => {
  const body = JSON.parse(data);
  const searchItems: SearchResponse = body?.tracks
  if(data && searchItems.items && (searchItems.total > 0)) {
    return transformTrack(body.tracks.items[0])
  } else {
    return Left(Error("Coudln't parse track response"))
  }
}

const transformTrack = (rawTrack: any): Either<Error, SpotifyTrack> => {
 if (rawTrack.name && rawTrack.artists[0]?.name && rawTrack.album?.name && rawTrack.id && rawTrack.uri) {
   return Right({
     name: rawTrack.name,
     artist: rawTrack.artists[0].name,
     album: rawTrack.album.name,
     id: rawTrack.id,
     uri: rawTrack.uri
   })
 } else {
   return Left(Error("Could not transform track"))
 }
}