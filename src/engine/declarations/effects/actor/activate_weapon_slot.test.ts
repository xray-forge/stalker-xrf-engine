import { beforeAll, describe, expect, it } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { EActiveItemSlot } from "@/engine/core/managers/actor";
import { callXrEffect } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/actor/activate_weapon_slot");
});

describe("activate_weapon_slot", () => {
  it("should activate slots for actor", () => {
    const actor: GameObject = MockGameObject.mockActor();

    expect(() => callXrEffect("activate_weapon_slot", actor, MockGameObject.mock())).toThrow(
      "Expected weapon slot to be provided as parameter in effect 'activate_weapon_slot'."
    );

    callXrEffect("activate_weapon_slot", actor, MockGameObject.mock(), EActiveItemSlot.PRIMARY);

    expect(actor.activate_slot).toHaveBeenCalledTimes(1);
    expect(actor.activate_slot).toHaveBeenCalledWith(EActiveItemSlot.PRIMARY);
  });
});
