import axios from "axios";
import { Moment } from "moment";

const fetchTopTracks = (
  username: string,
  startDate: Moment,
  endDate: Moment,
  limit: number
) => {
  const API_KEY = process.env.LASTFM_API_KEY;
  const LASTFM_BASE_URL = "http://ws.audioscrobbler.com/2.0/";
  const TOP_TRACKS_ENPOINT = generateTopTracksEndpoint(
    username,
    startDate,
    endDate,
    API_KEY
  );

  axios
    .get(LASTFM_BASE_URL + TOP_TRACKS_ENPOINT)
    .then(res => {
      const rawResponse: RawResponse = JSON.parse(JSON.stringify(res.data));
      const tracks = rawResponse.weeklytrackchart.track.map(track =>
        transformTrack(track)
      );
      const trimmedTracks = tracks.slice(0, limit + 1);
      console.log(tracks[0]);
    })
    .catch(err => console.log(err));
};

const generateTopTracksEndpoint = (
  username: string,
  startDate: Moment,
  endDate: Moment,
  apiKey: string
): string => {
  const startUnix = startDate.startOf("D").unix();
  const endUnix = endDate.endOf("D").unix();
  return `?method=user.getweeklytrackchart&user=${username}&api_key=${apiKey}&format=json&from=${startUnix}&to=${endUnix}`;
};

const transformTrack = (rawTrack: RawTrack): Track => {
  return {
    artist: rawTrack.artist["#text"],
    image: rawTrack.image.filter(i => i.size === "medium")[0]["#text"],
    name: rawTrack.name,
    playcount: rawTrack.playcount,
    rank: rawTrack["@attr"].rank
  };
};

export { fetchTopTracks, generateTopTracksEndpoint, transformTrack };
