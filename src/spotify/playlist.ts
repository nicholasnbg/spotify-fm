import { ErrorOr } from "./../util/ErrorOr";
import { PlaylistId, UserId } from "./types";
import axios from "axios";
import { Right, Left } from "monet";
export const generateNewPlaylist = async (
  authCode: string,
  playlistName: string,
  description: string,
  userId: UserId
): Promise<ErrorOr<PlaylistId>> => {
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
    headers,
    transformResponse: handleGeneratePlaylistResponse,
  };

  return axios.post(endpoint, JSON.stringify(data), config);
};

export const handleGeneratePlaylistResponse = (res: any, headers: any): ErrorOr<PlaylistId> => {
  const { data } = JSON.parse(res);
  if (data) {
    const { id } = data;
    return Right({ value: id });
  } else {
    return Left(Error("Error creating new playlist"));
  }
};
