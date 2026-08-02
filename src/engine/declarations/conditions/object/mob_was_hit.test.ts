import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject, MockMonsterHitInfo } from "xray16/mocks";

import { callXrCondition } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/conditions/object/mob_was_hit");
});

describe("mob_was_hit", () => {
  it("should check if object was hit", () => {
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(object, "get_monster_hit_info").mockImplementation(() => MockMonsterHitInfo.mock(null, 0, null));
    expect(callXrCondition("mob_was_hit", MockGameObject.mockActor(), object)).toBe(false);

    jest.spyOn(object, "get_monster_hit_info").mockImplementation(() => MockMonsterHitInfo.mock(null, 0));
    expect(callXrCondition("mob_was_hit", MockGameObject.mockActor(), object)).toBe(false);

    jest.spyOn(object, "get_monster_hit_info").mockImplementation(() => MockMonsterHitInfo.mock());
    expect(callXrCondition("mob_was_hit", MockGameObject.mockActor(), object)).toBe(true);
  });
});
