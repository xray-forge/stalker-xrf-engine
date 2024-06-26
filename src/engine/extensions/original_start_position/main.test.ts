import { beforeEach, describe, expect, it } from "@jest/globals";
import { set_start_game_vertex_id, set_start_position } from "xray16";

import { register } from "@/engine/extensions/original_start_position/main";
import { resetFunctionMock } from "@/fixtures/jest";

describe("original start position", () => {
  beforeEach(() => {
    resetFunctionMock(set_start_game_vertex_id);
    resetFunctionMock(set_start_position);
  });

  it("original_start_position should correctly change start positions", () => {
    register(true);

    expect(set_start_game_vertex_id).toHaveBeenCalledTimes(1);
    expect(set_start_position).toHaveBeenCalledTimes(1);
  });

  it("original_start_position should not change start positions on save", () => {
    register(false);

    expect(set_start_game_vertex_id).toHaveBeenCalledTimes(0);
    expect(set_start_position).toHaveBeenCalledTimes(0);
  });
});
