import { beforeAll, describe, expect, it } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { callXrEffect } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/object/give_money_to_npc");
});

describe("give_money_to_npc", () => {
  it("should give money for objects", () => {
    const object: GameObject = MockGameObject.mock();

    callXrEffect("give_money_to_npc", MockGameObject.mockActor(), object, 500);
    callXrEffect("give_money_to_npc", MockGameObject.mockActor(), object);

    expect(object.give_money).toHaveBeenCalledWith(500);
    expect(object.give_money).toHaveBeenCalledTimes(1);
  });
});
