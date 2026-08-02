import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { callXrCondition } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/conditions/object/is_door_blocked_by_npc");
});

describe("is_door_blocked_by_npc", () => {
  it("should check if door is blocked by npc", () => {
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(object, "is_door_blocked_by_npc").mockImplementation(() => true);
    expect(callXrCondition("is_door_blocked_by_npc", MockGameObject.mockActor(), object)).toBe(true);

    jest.spyOn(object, "is_door_blocked_by_npc").mockImplementation(() => false);
    expect(callXrCondition("is_door_blocked_by_npc", MockGameObject.mockActor(), object)).toBe(false);
  });
});
