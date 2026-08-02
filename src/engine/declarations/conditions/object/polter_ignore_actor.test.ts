import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { callXrCondition } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/conditions/object/polter_ignore_actor");
});

describe("polter_ignore_actor", () => {
  it("should check if poltergeist ignores actor", () => {
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(object, "poltergeist_get_actor_ignore").mockImplementation(() => true);
    expect(callXrCondition("polter_ignore_actor", MockGameObject.mockActor(), object)).toBe(true);

    jest.spyOn(object, "poltergeist_get_actor_ignore").mockImplementation(() => false);
    expect(callXrCondition("polter_ignore_actor", MockGameObject.mockActor(), object)).toBe(false);
  });
});
