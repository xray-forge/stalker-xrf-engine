import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { ServerHumanObject } from "xray16/alias";
import { MockAlifeHumanStalker, MockGameObject } from "xray16/mocks";

import { registerSimulator, registerStoryLink } from "@/engine/core/database";
import { callXrCondition, mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

beforeEach(() => {
  resetRegistry();
  registerSimulator();
});

beforeAll(() => {
  require("@/engine/declarations/conditions/object/distance_to_obj_le");
});

describe("distance_to_obj_le", () => {
  it("should check distance", () => {
    expect(
      callXrCondition("distance_to_obj_le", MockGameObject.mockActor(), MockGameObject.mock(), "test-sid", 10)
    ).toBe(false);

    const { actorGameObject } = mockRegisteredActor();
    const serverObject: ServerHumanObject = MockAlifeHumanStalker.mock();

    registerStoryLink(serverObject.id, "test-sid");

    jest.spyOn(actorGameObject.position(), "distance_to_sqr").mockImplementation(() => 100);
    expect(
      callXrCondition("distance_to_obj_le", MockGameObject.mockActor(), MockGameObject.mock(), "test-sid", 10)
    ).toBe(false);

    jest.spyOn(actorGameObject.position(), "distance_to_sqr").mockImplementation(() => 99);
    expect(
      callXrCondition("distance_to_obj_le", MockGameObject.mockActor(), MockGameObject.mock(), "test-sid", 10)
    ).toBe(true);
  });
});
