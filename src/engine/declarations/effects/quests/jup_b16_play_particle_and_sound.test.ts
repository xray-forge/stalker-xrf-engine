import { beforeAll, describe, expect, it } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject, MockParticleObject, MockPatrol, MockVector } from "xray16/mocks";

import { callXrEffect } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/quests/jup_b16_play_particle_and_sound");
});

describe("jup_b16_play_particle_and_sound", () => {
  it("should play the requested particle at the patrol point", () => {
    const object: GameObject = MockGameObject.mock({ name: "jup_b16_teleport" });

    MockParticleObject.REGISTRY.clear();
    MockPatrol.setup({
      jup_b16_teleport_particle: {
        points: [{ flag: 0, gvid: 0, lvid: 0, name: "particle-point", position: MockVector.create(1, 2, 3) }],
      },
    });

    callXrEffect("jup_b16_play_particle_and_sound", MockGameObject.mockActor(), object, 4);

    expect(MockParticleObject.REGISTRY.get("anomaly2\\teleport_out_00")?.play_at_pos).toHaveBeenCalledWith(
      MockVector.mock(1, 2, 3)
    );
  });
});
