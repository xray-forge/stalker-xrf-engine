import { describe, expect, it } from "@jest/globals";

import { getObjectId } from "@/engine/core/utils/object/object_get";
import { GameObject, ServerHumanObject } from "@/engine/lib/types";
import { MockAlifeHumanStalker, MockGameObject } from "@/fixtures/xray";

describe("getObjectId util", () => {
  it("getObjectId should correctly get ID from game objects", () => {
    const object: GameObject = MockGameObject.mock();

    expect(getObjectId(object)).toBe(object.id());
  });

  it("getObjectId should correctly get ID from server objects", () => {
    const object: ServerHumanObject = MockAlifeHumanStalker.mock();

    expect(getObjectId(object)).toBe(object.id);
  });
});
