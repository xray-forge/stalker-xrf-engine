import { describe, expect, it } from "@jest/globals";

import { IRegistryObjectState, registerObject } from "@/engine/core/database";
import { ISchemeMobCombatState } from "@/engine/core/schemes/monster/mob_combat/ISchemeMobCombatState";
import { MobCombatManager } from "@/engine/core/schemes/monster/mob_combat/MobCombatManager";
import { SchemeMobCombat } from "@/engine/core/schemes/monster/mob_combat/SchemeMobCombat";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini";
import { loadSchemeImplementation } from "@/engine/core/utils/scheme";
import { ClientObject, EScheme, IniFile } from "@/engine/lib/types";
import { MockLuaTable } from "@/fixtures/lua";
import { mockClientGameObject, mockIniFile } from "@/fixtures/xray";

describe("SchemeMobCombat", () => {
  it("should correctly activate", () => {
    const object: ClientObject = mockClientGameObject();
    const state: IRegistryObjectState = registerObject(object);
    const ini: IniFile = mockIniFile("test.ltx", {
      "mob_combat@test": {
        enabled: true,
      },
    });

    loadSchemeImplementation(SchemeMobCombat);

    SchemeMobCombat.activate(object, ini, EScheme.MOB_COMBAT, "mob_combat@test");

    const schemeState: ISchemeMobCombatState = state[EScheme.MOB_COMBAT] as ISchemeMobCombatState;

    expect(schemeState.logic).toEqualLuaTables(getConfigSwitchConditions(ini, "mob_combat@test")!);
    expect(schemeState.enabled).toBe(true);
    expect(schemeState.action).toBeInstanceOf(MobCombatManager);
    expect((schemeState.actions as unknown as MockLuaTable).getKeysArray()[0]).toBeInstanceOf(MobCombatManager);
  });

  it("should correctly disable", () => {
    const object: ClientObject = mockClientGameObject();
    const state: IRegistryObjectState = registerObject(object);
    const ini: IniFile = mockIniFile("test.ltx", {
      "mob_combat@test": {
        enabled: true,
      },
    });

    loadSchemeImplementation(SchemeMobCombat);

    SchemeMobCombat.activate(object, ini, EScheme.MOB_COMBAT, "mob_combat@test");

    const schemeState: ISchemeMobCombatState = state[EScheme.MOB_COMBAT] as ISchemeMobCombatState;

    expect(schemeState.enabled).toBe(true);

    SchemeMobCombat.disable(object, EScheme.MOB_COMBAT);
    expect(schemeState.enabled).toBe(false);
  });
});
