import { beforeAll, describe, expect, it } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject, MockPatrol } from "xray16/mocks";

import { registerSimulator, registry } from "@/engine/core/database";
import { callXrEffect } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/object/spawn_object");
});

describe("spawn_object", () => {
  it("should create an object at the requested patrol point", () => {
    const object: GameObject = MockGameObject.mock();

    registerSimulator();
    MockPatrol.setup({
      "spawn-path": {
        points: [{ flag: 0, gvid: 44, lvid: 25, name: "spawn-point", position: object.position() as any }],
      },
    });

    callXrEffect("spawn_object", MockGameObject.mockActor(), object, "test-object", "spawn-path", 0, 90);

    expect(registry.simulator.create).toHaveBeenCalledWith("test-object", object.position(), 25, 44);
  });
});
