import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { callXrCondition } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/conditions/actor/talking");
});

describe("talking", () => {
  it("should check if actor is talking", () => {
    const actor: GameObject = MockGameObject.mockActor();

    jest.spyOn(actor, "is_talking").mockImplementation(() => false);
    expect(callXrCondition("talking", actor, MockGameObject.mock())).toBe(false);

    jest.spyOn(actor, "is_talking").mockImplementation(() => true);
    expect(callXrCondition("talking", actor, MockGameObject.mock())).toBe(true);
  });
});
