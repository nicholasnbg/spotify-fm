import { PlaylistId, UserId } from "./types";
import axios from "axios";
import { right, left, Either } from "fp-ts/lib/Either";
export const generateNewPlaylist = async (
  authCode: string,
  playlistName: string,
  description: string,
  userId: UserId
): Promise<Either<Error, PlaylistId>> => {
  const data = JSON.stringify({
    name: playlistName,
    description,
  });

  const endpoint = `https://api.spotify.com/v1/users/${userId.value}/playlists`

  const headers = {
    Authorization: `Bearer ${authCode}`,
    "Content-Type": "application/json",
  };

  const config = {
    headers
  };

  return axios.post(endpoint, JSON.stringify(data), config).then(res => handleGeneratePlaylistResponse(res))
};

export const handleGeneratePlaylistResponse = (res: any,): Either<Error, PlaylistId> => {
  const {data} = res;
  return data?.id ? right({ value: data.id }): left(Error("Error creating new playlist"));
};
