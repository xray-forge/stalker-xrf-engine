import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject, ServerHumanObject } from "xray16/alias";
import { MockAlifeHumanStalker, MockGameObject, MockPatrol } from "xray16/mocks";

import { registerSimulator, registry } from "@/engine/core/database";
import { callXrEffect, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/object/spawn_corpse");
});

beforeEach(() => {
  resetRegistry();
});

describe("spawn_corpse", () => {
  it("should create and immediately kill a creature at the requested patrol point", () => {
    const object: GameObject = MockGameObject.mock();
    const corpse = MockAlifeHumanStalker.mock({ id: 501 });

    registerSimulator();
    MockPatrol.setup({
      "corpse-path": {
        points: [{ flag: 0, gvid: 55, lvid: 35, name: "corpse-point", position: object.position() as any }],
      },
    });
    jest.spyOn(corpse, "kill");
    jest.spyOn(registry.simulator, "create").mockImplementationOnce(() => corpse);

    callXrEffect("spawn_corpse", MockGameObject.mockActor(), object, "test_stalker", "corpse-path", 0);

    expect(registry.simulator.create).toHaveBeenCalledWith("test_stalker", object.position(), 35, 55);
    expect(corpse.kill).toHaveBeenCalledTimes(1);
  });

  it("should reject a missing section, a missing path, and an unknown path", () => {
    const object: GameObject = MockGameObject.mock();

    registerSimulator();

    expect(() => callXrEffect("spawn_corpse", MockGameObject.mockActor(), object)).toThrow();
    expect(() => callXrEffect("spawn_corpse", MockGameObject.mockActor(), object, "stalker_section")).toThrow();
    expect(() =>
      callXrEffect("spawn_corpse", MockGameObject.mockActor(), object, "stalker_section", "missing-path")
    ).toThrow();
  });

  it("should spawn at the requested patrol index", () => {
    const object: GameObject = MockGameObject.mock();
    const corpse: ServerHumanObject = MockAlifeHumanStalker.mock({ id: 601 });

    registerSimulator();
    MockPatrol.setup({
      "corpse-path": {
        points: [
          { flag: 0, gvid: 1, lvid: 2, name: "first", position: object.position() as never },
          { flag: 0, gvid: 3, lvid: 4, name: "second", position: object.position() as never },
        ],
      },
    });
    jest.spyOn(registry.simulator, "create").mockImplementation(() => corpse);
    jest.spyOn(corpse, "kill");

    callXrEffect("spawn_corpse", MockGameObject.mockActor(), object, "stalker_section", "corpse-path", 1);

    expect(corpse.kill).toHaveBeenCalledTimes(1);
  });
});
