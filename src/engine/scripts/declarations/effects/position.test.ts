import { beforeAll, describe, it } from "@jest/globals";

import { checkXrEffect } from "@/fixtures/engine";

describe("'position' effects declaration", () => {
  beforeAll(() => {
    require("@/engine/scripts/declarations/effects/position");
  });

  it("should correctly inject external methods for game", () => {
    checkXrEffect("teleport_npc");
    checkXrEffect("teleport_npc_by_story_id");
    checkXrEffect("teleport_squad");
    checkXrEffect("teleport_actor");
    checkXrEffect("play_particle_on_path");
  });
});
