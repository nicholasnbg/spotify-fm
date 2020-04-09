import { left, right } from "fp-ts/lib/Either";
import { handleGeneratePlaylistResponse } from "./playlist";

describe("handleGeneratePlaylistResponse", () => {
  test("handles valid response", () => {
    const response = {
      data: { id: "1234" },
    };

    const result = handleGeneratePlaylistResponse(response);

    expect(result).toEqual(
      right({
        value: response.data.id,
      })
    );
  });

  test("handles invalid response", () => {
    const result = handleGeneratePlaylistResponse({});

    expect(result).toEqual(
      left(
        Error("Error creating new playlist")
      )
    )
  })
});
