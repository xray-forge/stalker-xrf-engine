import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { callXrCondition } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/conditions/object/npc_talking");
});

describe("npc_talking", () => {
  it("should check if object is talking", () => {
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(object, "is_talking").mockImplementation(() => true);
    expect(callXrCondition("npc_talking", MockGameObject.mockActor(), object)).toBe(true);

    jest.spyOn(object, "is_talking").mockImplementation(() => false);
    expect(callXrCondition("npc_talking", MockGameObject.mockActor(), object)).toBe(false);
  });
});
