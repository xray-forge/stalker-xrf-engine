import { describe, expect, it } from "@jest/globals";

import { AnyObject, TName } from "@/engine/lib/types";

describe("'position' effects declaration", () => {
  const checkBinding = (name: TName, container: AnyObject = global) => {
    expect(container["xr_effects"][name]).toBeDefined();
  };

  it("should correctly inject external methods for game", () => {
    require("@/engine/scripts/declarations/effects/position");

    checkBinding("teleport_npc");
    checkBinding("teleport_npc_by_story_id");
    checkBinding("teleport_squad");
    checkBinding("teleport_actor");
    checkBinding("play_particle_on_path");
  });
});
