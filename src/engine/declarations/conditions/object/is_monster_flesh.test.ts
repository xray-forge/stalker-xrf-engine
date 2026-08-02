import { beforeAll, describe, expect, it } from "@jest/globals";
import { clsid } from "xray16";
import { MockGameObject } from "xray16/mocks";

import { callXrCondition } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/conditions/object/is_monster_flesh");
});

describe("is_monster_flesh", () => {
  it("should check object", () => {
    expect(
      callXrCondition("is_monster_flesh", MockGameObject.mockActor(), MockGameObject.mockWithClassId(clsid.flesh_s))
    ).toBe(true);
    expect(
      callXrCondition("is_monster_flesh", MockGameObject.mockActor(), MockGameObject.mockWithClassId(clsid.zombie_s))
    ).toBe(false);
  });
});
