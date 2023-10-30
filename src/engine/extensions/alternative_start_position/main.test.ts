import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { level, set_start_game_vertex_id, set_start_position } from "xray16";

import { register } from "@/engine/extensions/alternative_start_position/main";
import { resetFunctionMock } from "@/fixtures/jest";

describe("alternative start position", () => {
  beforeEach(() => {
    resetFunctionMock(set_start_game_vertex_id);
    resetFunctionMock(set_start_position);
  });

  it("alternative_start_position should correctly change start positions when on zaton", () => {
    jest.spyOn(level, "name").mockImplementation(() => "zaton");

    register(true);

    expect(set_start_game_vertex_id).toHaveBeenCalledTimes(1);
    expect(set_start_position).toHaveBeenCalledTimes(1);
  });

  it("alternative_start_position should not change start positions if not zaton", () => {
    jest.spyOn(level, "name").mockImplementation(() => "jupiter");

    register(true);

    expect(set_start_game_vertex_id).toHaveBeenCalledTimes(0);
    expect(set_start_position).toHaveBeenCalledTimes(0);
  });

  it("alternative_start_position should not change start positions on save", () => {
    jest.spyOn(level, "name").mockImplementation(() => "zaton");

    register(false);

    expect(set_start_game_vertex_id).toHaveBeenCalledTimes(0);
    expect(set_start_position).toHaveBeenCalledTimes(0);
  });
});
