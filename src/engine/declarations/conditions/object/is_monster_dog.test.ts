import { beforeAll, describe, expect, it } from "@jest/globals";
import { clsid } from "xray16";
import { MockGameObject } from "xray16/mocks";

import { callXrCondition } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/conditions/object/is_monster_dog");
});

describe("is_monster_dog", () => {
  it("should check object", () => {
    expect(
      callXrCondition("is_monster_dog", MockGameObject.mockActor(), MockGameObject.mockWithClassId(clsid.dog_s))
    ).toBe(true);
    expect(
      callXrCondition("is_monster_dog", MockGameObject.mockActor(), MockGameObject.mockWithClassId(clsid.zombie_s))
    ).toBe(false);
  });
});
