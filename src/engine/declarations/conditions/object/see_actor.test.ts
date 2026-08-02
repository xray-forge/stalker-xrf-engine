import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { callXrCondition } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/conditions/object/see_actor");
});

describe("see_actor", () => {
  it("should check if object is alive and see actor", () => {
    const actor: GameObject = MockGameObject.mockActor();
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(object, "alive").mockImplementation(() => true);
    jest.spyOn(object, "see").mockImplementation(() => true);

    expect(callXrCondition("see_actor", actor, object)).toBe(true);
    expect(object.alive).toHaveBeenCalled();
    expect(object.see).toHaveBeenCalledWith(actor);

    jest.spyOn(object, "alive").mockImplementation(() => true);
    jest.spyOn(object, "see").mockImplementation(() => false);

    expect(callXrCondition("see_actor", actor, object)).toBe(false);

    jest.spyOn(object, "alive").mockImplementation(() => false);
    jest.spyOn(object, "see").mockImplementation(() => true);

    expect(callXrCondition("see_actor", actor, object)).toBe(false);
  });
});
