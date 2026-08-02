import { beforeAll, describe, expect, it } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject, MockPatrol, MockVector } from "xray16/mocks";

import { callXrEffect } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/quests/jup_teleport_actor");
});

describe("jup_teleport_actor", () => {
  it("should preserve the actor offset between teleport patrol points", () => {
    const actor: GameObject = MockGameObject.mockActor({ position: MockVector.mock(12, 5, 8) });

    MockPatrol.setup({
      jup_b16_teleport_in: {
        points: [{ flag: 0, gvid: 0, lvid: 0, name: "in", position: MockVector.create(10, 1, 3) }],
      },
      jup_b16_teleport_out: {
        points: [{ flag: 0, gvid: 0, lvid: 0, name: "out", position: MockVector.create(50, 20, 30) }],
      },
    });

    callXrEffect("jup_teleport_actor", actor, MockGameObject.mock());

    expect(actor.set_actor_position).toHaveBeenCalledWith(expect.objectContaining({ x: 52, y: 24, z: 35 }));
  });
});
