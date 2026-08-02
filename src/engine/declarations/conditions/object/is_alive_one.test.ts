import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { ServerHumanObject, ServerMonsterBaseObject } from "xray16/alias";
import { MockAlifeHumanStalker, MockAlifeMonsterBase, MockGameObject } from "xray16/mocks";

import { registerSimulator, registerStoryLink } from "@/engine/core/database";
import { callXrCondition, resetRegistry } from "@/fixtures/engine";

beforeEach(() => {
  resetRegistry();
  registerSimulator();
});

beforeAll(() => {
  require("@/engine/declarations/conditions/object/is_alive_one");
});

describe("is_alive_one", () => {
  it("should check if one of objects is alive", () => {
    expect(callXrCondition("is_alive_one", MockGameObject.mockActor(), MockGameObject.mock())).toBe(false);
    expect(callXrCondition("is_alive_one", MockGameObject.mockActor(), MockGameObject.mock(), "test-sid")).toBe(false);

    const first: ServerHumanObject = MockAlifeHumanStalker.mock();
    const second: ServerMonsterBaseObject = MockAlifeMonsterBase.mock();

    registerStoryLink(first.id, "first-sid");
    registerStoryLink(second.id, "second-sid");

    expect(callXrCondition("is_alive_one", MockGameObject.mockActor(), MockGameObject.mock(), "test-sid")).toBe(false);
    expect(callXrCondition("is_alive_one", MockGameObject.mockActor(), MockGameObject.mock(), "first-sid")).toBe(true);
    expect(callXrCondition("is_alive_one", MockGameObject.mockActor(), MockGameObject.mock(), "second-sid")).toBe(
      false
    );
    expect(
      callXrCondition("is_alive_one", MockGameObject.mockActor(), MockGameObject.mock(), "first-sid", "second-sid")
    ).toBe(true);
  });
});
