import { describe, expect, it } from "@jest/globals";
import { set_start_game_vertex_id, set_start_position } from "xray16";

import { register } from "@/engine/extensions/alternative_start_position/main";

describe("alternative start position", () => {
  it("alternative_start_position should correctly change start positions", () => {
    register();

    expect(set_start_game_vertex_id).toHaveBeenCalledTimes(1);
    expect(set_start_position).toHaveBeenCalledTimes(1);
  });
});
