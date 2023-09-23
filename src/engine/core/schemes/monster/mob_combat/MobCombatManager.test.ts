import { describe, expect, it, jest } from "@jest/globals";

import { IRegistryObjectState, registerObject } from "@/engine/core/database";
import { ISchemeMobCombatState } from "@/engine/core/schemes/monster/mob_combat/ISchemeMobCombatState";
import { MobCombatManager } from "@/engine/core/schemes/monster/mob_combat/MobCombatManager";
import { trySwitchToAnotherSection } from "@/engine/core/utils/scheme";
import { ClientObject, EScheme } from "@/engine/lib/types";
import { mockSchemeState } from "@/fixtures/engine";
import { mockClientGameObject } from "@/fixtures/xray";

jest.mock("@/engine/core/utils/scheme/scheme_switch", () => ({ trySwitchToAnotherSection: jest.fn() }));

describe("MobCombatManager", () => {
  it("should correctly handle combat scheme event", () => {
    const object: ClientObject = mockClientGameObject();
    const state: IRegistryObjectState = registerObject(object);
    const schemeState: ISchemeMobCombatState = mockSchemeState<ISchemeMobCombatState>(EScheme.MOB_COMBAT);
    const manager: MobCombatManager = new MobCombatManager(object, schemeState);

    manager.onCombat();

    expect(trySwitchToAnotherSection).not.toHaveBeenCalled();

    schemeState.enabled = true;
    manager.onCombat();

    expect(trySwitchToAnotherSection).not.toHaveBeenCalled();

    jest.spyOn(object, "get_enemy").mockImplementation(() => mockClientGameObject());
    manager.onCombat();

    expect(trySwitchToAnotherSection).not.toHaveBeenCalled();

    state.activeScheme = EScheme.MOB_HOME;
    manager.onCombat();

    expect(trySwitchToAnotherSection).toHaveBeenCalledTimes(1);
  });
});
