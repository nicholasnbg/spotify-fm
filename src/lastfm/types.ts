interface RawResponse {
  weeklytrackchart: {
    "@attr": {
      user: string;
      from: string;
      to: string;
    };
    track: RawTrack[]
  }
}

interface RawTrack {
  artist: {
    mbid: string;
    "#text": string;
  };
  "@attr": {
    "rank": number;
  };
  image: {
    size: string;
    "#text": string;
  }[];
  name: string;
  playcount: number;
}

interface LastFmTrack {
  name: string;
  artist: string;
  rank: number;
  playcount: number;
  image: string;
}
