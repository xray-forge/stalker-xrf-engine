import { beforeAll, describe, expect, it } from "@jest/globals";
import { MockGameObject } from "xray16/mocks";

import { callXrCondition } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/conditions/actor/is_enemy_actor");
});

describe("is_enemy_actor", () => {
  it("should check if actor and object are enemies", () => {
    expect(callXrCondition("is_enemy_actor", MockGameObject.mockActor(), MockGameObject.mock())).toBe(true);
    expect(callXrCondition("is_enemy_actor", MockGameObject.mock(), MockGameObject.mock())).toBe(false);
  });
});
