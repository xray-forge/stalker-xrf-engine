import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { MockGameObject } from "xray16/mocks";

import { weapons } from "@/engine/constants/items/weapons";
import { callXrCondition, mockRegisteredActor } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/conditions/actor/actor_has_active_nimble_weapon");
});

describe("actor_has_active_nimble_weapon", () => {
  it("should check if actor has active nimble weapon", () => {
    const { actorGameObject } = mockRegisteredActor();

    expect(callXrCondition("actor_has_active_nimble_weapon", actorGameObject, MockGameObject.mock())).toBe(false);

    jest.spyOn(actorGameObject, "item_in_slot").mockImplementation(() => MockGameObject.mock());

    expect(callXrCondition("actor_has_active_nimble_weapon", actorGameObject, MockGameObject.mock())).toBe(false);

    jest.spyOn(actorGameObject, "item_in_slot").mockImplementation((slot) => {
      return slot === 2 ? MockGameObject.mockWithSection(weapons.wpn_fn2000_nimble) : MockGameObject.mock();
    });

    expect(callXrCondition("actor_has_active_nimble_weapon", actorGameObject, MockGameObject.mock())).toBe(true);

    jest.spyOn(actorGameObject, "item_in_slot").mockImplementation((slot) => {
      return slot === 3 ? MockGameObject.mockWithSection(weapons.wpn_fn2000_nimble) : MockGameObject.mock();
    });

    expect(callXrCondition("actor_has_active_nimble_weapon", actorGameObject, MockGameObject.mock())).toBe(true);
  });
});
