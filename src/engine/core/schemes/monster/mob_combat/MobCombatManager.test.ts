import { describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { IRegistryObjectState, registerObject } from "@/engine/core/database";
import { ISchemeMobCombatState } from "@/engine/core/schemes/monster/mob_combat/mob_combat_types";
import { MobCombatManager } from "@/engine/core/schemes/monster/mob_combat/MobCombatManager";
import { trySwitchToAnotherSection } from "@/engine/core/schemes/runtime";
import { EScheme } from "@/engine/lib/types";
import { mockSchemeState } from "@/fixtures/engine";

jest.mock("@/engine/core/schemes/runtime/scheme_switch", () => ({ trySwitchToAnotherSection: jest.fn() }));

describe("MobCombatManager", () => {
  it("should correctly handle combat scheme event", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);
    const schemeState: ISchemeMobCombatState = mockSchemeState<ISchemeMobCombatState>(EScheme.MOB_COMBAT);
    const manager: MobCombatManager = new MobCombatManager(object, schemeState);

    manager.onCombat();

    expect(trySwitchToAnotherSection).not.toHaveBeenCalled();

    schemeState.enabled = true;
    manager.onCombat();

    expect(trySwitchToAnotherSection).not.toHaveBeenCalled();

    jest.spyOn(object, "get_enemy").mockImplementation(() => MockGameObject.mock());
    manager.onCombat();

    expect(trySwitchToAnotherSection).not.toHaveBeenCalled();

    state.activeScheme = EScheme.MOB_HOME;
    manager.onCombat();

    expect(trySwitchToAnotherSection).toHaveBeenCalledTimes(1);
  });
});
