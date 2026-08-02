import { beforeAll, describe, expect, it } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { callXrEffect } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/actor/kill_actor");
});

describe("kill_actor", () => {
  it("should kill actor", () => {
    const actor: GameObject = MockGameObject.mockActor();

    callXrEffect("kill_actor", actor, MockGameObject.mock());

    expect(actor.kill).toHaveBeenCalledTimes(1);
    expect(actor.kill).toHaveBeenCalledWith(actor);
  });
});
