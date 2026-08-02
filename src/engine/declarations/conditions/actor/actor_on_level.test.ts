import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { level } from "xray16";
import { MockGameObject } from "xray16/mocks";

import { callXrCondition } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/conditions/actor/actor_on_level");
});

describe("actor_on_level", () => {
  it("should check if actor is on level", () => {
    expect(
      callXrCondition(
        "actor_on_level",
        MockGameObject.mockActor(),
        MockGameObject.mock(),
        "not-existing",
        "not-existing-2"
      )
    ).toBe(false);

    jest.spyOn(level, "name").mockImplementationOnce(() => "zaton");

    expect(
      callXrCondition(
        "actor_on_level",
        MockGameObject.mockActor(),
        MockGameObject.mock(),
        "jupiter",
        "pripyat",
        "zaton"
      )
    ).toBe(true);

    jest.spyOn(level, "name").mockImplementationOnce(() => "another");

    expect(
      callXrCondition(
        "actor_on_level",
        MockGameObject.mockActor(),
        MockGameObject.mock(),
        "jupiter",
        "pripyat",
        "zaton"
      )
    ).toBe(false);
  });
});
