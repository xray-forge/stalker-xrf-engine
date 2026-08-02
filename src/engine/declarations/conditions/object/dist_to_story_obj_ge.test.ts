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
  require("@/engine/declarations/conditions/object/dist_to_story_obj_ge");
});

describe("dist_to_story_obj_ge", () => {
  it("should check distance", () => {
    const { actorGameObject } = mockRegisteredActor();
    const serverObject: ServerHumanObject = MockAlifeHumanStalker.mock();

    expect(callXrCondition("dist_to_story_obj_ge", actorGameObject, MockGameObject.mock(), "test-sid", 10)).toBe(true);

    registerStoryLink(serverObject.id, "test-sid");

    jest.spyOn(serverObject.position, "distance_to_sqr").mockImplementation(() => 99);
    expect(callXrCondition("dist_to_story_obj_ge", actorGameObject, MockGameObject.mock(), "test-sid", 10)).toBe(false);

    jest.spyOn(serverObject.position, "distance_to_sqr").mockImplementation(() => 101);
    expect(callXrCondition("dist_to_story_obj_ge", actorGameObject, MockGameObject.mock(), "test-sid", 10)).toBe(true);

    expect(serverObject.position.distance_to_sqr).toHaveBeenCalledWith(actorGameObject.position());
  });
});
