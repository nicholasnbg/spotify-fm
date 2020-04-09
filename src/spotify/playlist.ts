import { PlaylistId, UserId } from "./types";
import axios from "axios";
import { right, left, Either, flatten } from "fp-ts/lib/Either";
import * as T from "fp-ts/lib/Task";
import * as TE from "fp-ts/lib/TaskEither";

export const generateNewPlaylist = (
  authCode: string,
  playlistName: string,
  description: string,
  userId: UserId
): T.Task<Either<Error, PlaylistId>> => {

  console.log("CREATING PLAYLIST")

  const data = JSON.stringify({
    name: playlistName,
    description,
  });

  const endpoint = `https://api.spotify.com/v1/users/${userId.value}/playlists`;

  const headers = {
    Authorization: `Bearer ${authCode}`,
    "Content-Type": "application/json",
  };

  const config = {
    headers,
  };

  return T.map(flatten)(TE.tryCatch(
    () => axios.post(endpoint, data, config).then((res) => handleGeneratePlaylistResponse(res)),
    (err) => new Error("Error creating new playlist: " + String(err))
  ));
};

export const handleGeneratePlaylistResponse = (res: any): Either<Error, PlaylistId> => {
  const {data} = res;
  return data?.id ? right({ value: data.id }): left(Error("Error creating new playlist"));
};
