import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { callXrCondition, mockRegisteredActor } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/conditions/object/active_item");
});

describe("active_item", () => {
  it("should check object active item", () => {
    const { actorGameObject } = mockRegisteredActor();

    const first: GameObject = MockGameObject.mock({ section: "test-1" });
    const second: GameObject = MockGameObject.mock({ section: "test-2" });

    expect(callXrCondition("active_item", actorGameObject, MockGameObject.mock())).toBe(false);
    expect(
      callXrCondition("active_item", actorGameObject, MockGameObject.mock(), first.section(), second.section())
    ).toBe(false);

    jest.spyOn(actorGameObject, "item_in_slot").mockImplementation(() => first);

    expect(
      callXrCondition("active_item", actorGameObject, MockGameObject.mock(), first.section(), second.section())
    ).toBe(true);

    expect(callXrCondition("active_item", actorGameObject, MockGameObject.mock(), first.section())).toBe(true);
    expect(callXrCondition("active_item", actorGameObject, MockGameObject.mock(), second.section())).toBe(false);
  });
});
