import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { ServerHumanObject } from "xray16/alias";
import { MockAlifeHumanStalker, MockGameObject } from "xray16/mocks";

import { registerSimulator, registerStoryLink } from "@/engine/core/database";
import { callXrCondition, resetRegistry } from "@/fixtures/engine";

beforeEach(() => {
  resetRegistry();
  registerSimulator();
});

beforeAll(() => {
  require("@/engine/declarations/conditions/object/squad_exist");
});

describe("squad_exist", () => {
  it("should check if squad exists", () => {
    const object: ServerHumanObject = MockAlifeHumanStalker.mock();

    registerStoryLink(object.id, "test-story");

    expect(callXrCondition("squad_exist", MockGameObject.mockActor(), MockGameObject.mock(), "test-story")).toBe(true);
    expect(callXrCondition("squad_exist", MockGameObject.mockActor(), MockGameObject.mock(), "void")).toBe(false);

    expect(() => callXrCondition("squad_exist", MockGameObject.mockActor(), MockGameObject.mock())).toThrow(
      "Wrong parameter storyId 'nil' in squad_exist condition."
    );
  });
});
