import axios from "axios";
import { Moment } from "moment";

const fetchTopTracks = (username: string, startDate: Moment, endDate: Moment, limit: number) => {
  const API_KEY = process.env.LASTFM_API_KEY;
  const LASTFM_BASE_URL = "http://ws.audioscrobbler.com/2.0/";
  const TOP_TRACKS_ENPOINT = generateTopTracksEndpoint(username, startDate, endDate, API_KEY);

  return axios
    .get(LASTFM_BASE_URL + TOP_TRACKS_ENPOINT)
    .then(res => {
      const rawResponse: RawResponse = JSON.parse(JSON.stringify(res.data));
      const tracks = rawResponse.weeklytrackchart.track.map(track => transformTrack(track));
      return tracks.slice(0, limit);
    })
    .catch(err => {
      throw Error(err);
    });
};

const generateTopTracksEndpoint = (username: string, startDate: Moment, endDate: Moment, apiKey: string): string => {
  const startUnix = startDate.startOf("D").unix();
  const endUnix = endDate.endOf("D").unix();
  return `?method=user.getweeklytrackchart&user=${username}&api_key=${apiKey}&format=json&from=${startUnix}&to=${endUnix}`;
};

const transformTrack = (rawTrack: RawTrack): LastFmTrack => {

  if(rawTrack.name == null) {
    console.log("The fucking name is null")
  }

  return {
    artist: rawTrack.artist["#text"],
    image: rawTrack.image.filter(i => i.size === "medium")[0]["#text"],
    name: rawTrack.name,
    playcount: rawTrack.playcount,
    rank: rawTrack["@attr"].rank
  };
};

export { fetchTopTracks, generateTopTracksEndpoint, transformTrack };
