import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { callXrEffect, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/object/kill_npc");
});

beforeEach(() => {
  resetRegistry();
});

describe("kill_npc", () => {
  it("should kill an alive object only", () => {
    const alive: GameObject = MockGameObject.mock({ alive: true });
    const dead: GameObject = MockGameObject.mock({ alive: false });

    callXrEffect("kill_npc", MockGameObject.mockActor(), alive);
    callXrEffect("kill_npc", MockGameObject.mockActor(), dead);

    expect(alive.kill).toHaveBeenCalledWith(alive);
    expect(dead.kill).not.toHaveBeenCalled();
  });
});
