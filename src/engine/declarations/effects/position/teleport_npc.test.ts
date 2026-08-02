import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { patrol } from "xray16";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { resetStalkerState } from "@/engine/core/database";
import { callXrEffect, resetRegistry } from "@/fixtures/engine";

jest.mock("@/engine/core/database/stalker");

beforeAll(() => {
  require("@/engine/declarations/effects/position/teleport_npc");
});

beforeEach(() => {
  resetRegistry();
});

describe("teleport_npc", () => {
  it("should teleport objects", () => {
    expect(() => callXrEffect("teleport_npc", MockGameObject.mockActor(), MockGameObject.mock())).toThrow(
      "Wrong parameters in 'teleport_npc' function."
    );

    const object: GameObject = MockGameObject.mock();

    callXrEffect("teleport_npc", MockGameObject.mockActor(), object, "test-wp");

    expect(resetStalkerState).toHaveBeenCalledWith(object);
    expect(object.set_npc_position).toHaveBeenCalledWith(new patrol("test-wp").point(0));

    callXrEffect("teleport_npc", MockGameObject.mockActor(), object, "test-wp", 1);

    expect(resetStalkerState).toHaveBeenCalledWith(object);
    expect(object.set_npc_position).toHaveBeenCalledWith(new patrol("test-wp").point(1));
  });
});
