import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockAlifeObject, MockAlifeSimulator, MockGameObject } from "xray16/mocks";

import { registerSimulator, registerStoryLink, registry } from "@/engine/core/database";
import { callXrEffect, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/object/destroy_object");
});

beforeEach(() => {
  resetRegistry();
});

describe("destroy_object", () => {
  it("should release linked objects and reject incomplete target descriptors", () => {
    const object: GameObject = MockGameObject.mock();
    const serverObject = MockAlifeObject.create({ id: object.id() });
    const targetObject = MockAlifeObject.create();

    registerSimulator();
    MockAlifeSimulator.addToRegistry(serverObject);
    MockAlifeSimulator.addToRegistry(targetObject);
    registerStoryLink(targetObject.id, "target");

    callXrEffect("destroy_object", MockGameObject.mockActor(), object);

    expect(() => callXrEffect("destroy_object", MockGameObject.mockActor(), object, "story")).toThrow(
      "Wrong parameters in destroy_object function."
    );

    callXrEffect("destroy_object", MockGameObject.mockActor(), object, "story", "target");

    expect(registry.simulator.release).toHaveBeenCalledWith(serverObject, true);
    expect(registry.simulator.release).toHaveBeenCalledWith(targetObject, true);
  });

  it("should resolve target descriptors supplied with a third parameter", () => {
    const object: GameObject = MockGameObject.mock();
    const targetObject = MockAlifeObject.create();

    registerSimulator();
    MockAlifeSimulator.addToRegistry(targetObject);
    registerStoryLink(targetObject.id, "target");

    // Target type has to come from the first parameter, not from the tuple itself.
    callXrEffect("destroy_object", MockGameObject.mockActor(), object, "story", "target", "extra");

    expect(registry.simulator.release).toHaveBeenCalledWith(targetObject, true);
  });
});
