import { describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { IRegistryObjectState, registerObject } from "@/engine/core/database";
import { ISchemeMobCombatState } from "@/engine/core/schemes/monster/mob_combat/mob_combat_types";
import { MobCombatController } from "@/engine/core/schemes/monster/mob_combat/MobCombatController";
import { trySwitchToAnotherSection } from "@/engine/core/schemes/runtime";
import { EScheme } from "@/engine/core/schemes/types";
import { mockSchemeState } from "@/fixtures/engine";

jest.mock("@/engine/core/schemes/runtime/scheme_switch", () => ({ trySwitchToAnotherSection: jest.fn() }));

describe("MobCombatController", () => {
  it("should correctly handle combat scheme event", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);
    const schemeState: ISchemeMobCombatState = mockSchemeState<ISchemeMobCombatState>(EScheme.MOB_COMBAT);
    const controller: MobCombatController = new MobCombatController(object, schemeState);

    controller.onCombat();

    expect(trySwitchToAnotherSection).not.toHaveBeenCalled();

    schemeState.enabled = true;
    controller.onCombat();

    expect(trySwitchToAnotherSection).not.toHaveBeenCalled();

    jest.spyOn(object, "get_enemy").mockImplementation(() => MockGameObject.mock());
    controller.onCombat();

    expect(trySwitchToAnotherSection).not.toHaveBeenCalled();

    state.activeScheme = EScheme.MOB_HOME;
    controller.onCombat();

    expect(trySwitchToAnotherSection).toHaveBeenCalledTimes(1);
  });
});
