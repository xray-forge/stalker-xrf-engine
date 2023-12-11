import { beforeAll, describe, it } from "@jest/globals";

import { checkXrEffect } from "@/fixtures/engine";

describe("position effects declaration", () => {
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

describe("position effects implementation", () => {
  beforeAll(() => {
    require("@/engine/scripts/declarations/effects/position");
  });

  it.todo("teleport_npc should teleport objects");

  it.todo("teleport_npc_by_story_id should teleport objects by story ids");

  it.todo("teleport_squad should teleport squads");

  it.todo("teleport_actor should teleport actors");

  it.todo("play_particle_on_path should play particles");
});
