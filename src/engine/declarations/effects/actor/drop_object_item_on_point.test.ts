import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { patrol } from "xray16";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { callXrEffect, mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/actor/drop_object_item_on_point");
});

beforeEach(() => {
  resetRegistry();
});

describe("drop_object_item_on_point", () => {
  it("should drop objects on points", () => {
    const item: GameObject = MockGameObject.mock({ section: "test_section" });
    const { actorGameObject } = mockRegisteredActor({ inventory: [["test_section", item]] });

    expect(() => {
      callXrEffect("drop_object_item_on_point", actorGameObject, MockGameObject.mock(), "not_existing", "patrol_path");
    }).toThrow("Actor has no item to drop with section 'not_existing'.");

    callXrEffect("drop_object_item_on_point", actorGameObject, MockGameObject.mock(), "test_section", "test-wp");

    expect(actorGameObject.drop_item_and_teleport).toHaveBeenCalledTimes(1);
    expect(actorGameObject.drop_item_and_teleport).toHaveBeenCalledWith(item, new patrol("test-wp").point(0));
  });
});
