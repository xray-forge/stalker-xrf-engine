import { beforeAll, describe, expect, it } from "@jest/globals";
import { MockGameObject } from "xray16/mocks";

import { registerStoryLink } from "@/engine/core/database";
import { callXrCondition } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/conditions/object/object_exist");
});

describe("object_exist", () => {
  it("should check if object exists", () => {
    expect(callXrCondition("object_exist", MockGameObject.mockActor(), MockGameObject.mock(), "test-sid")).toBe(false);

    registerStoryLink(MockGameObject.mock().id(), "test-sid");
    expect(callXrCondition("object_exist", MockGameObject.mockActor(), MockGameObject.mock(), "test-sid")).toBe(true);
  });
});
