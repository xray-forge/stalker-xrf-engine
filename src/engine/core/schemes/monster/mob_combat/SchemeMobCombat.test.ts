import { describe, expect, it } from "@jest/globals";

import { registerObject } from "@/engine/core/database";
import { ISchemeMobCombatState } from "@/engine/core/schemes/monster/mob_combat/mob_combat_types";
import { MobCombatManager } from "@/engine/core/schemes/monster/mob_combat/MobCombatManager";
import { SchemeMobCombat } from "@/engine/core/schemes/monster/mob_combat/SchemeMobCombat";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini";
import { loadSchemeImplementation } from "@/engine/core/utils/scheme";
import { EScheme, GameObject, IniFile } from "@/engine/lib/types";
import { assertSchemeSubscribedToManager } from "@/fixtures/engine";
import { MockGameObject, MockIniFile } from "@/fixtures/xray";

describe("SchemeMobCombat", () => {
  it("should correctly activate", () => {
    const object: GameObject = MockGameObject.mock();
    const ini: IniFile = MockIniFile.mock("test.ltx", {
      "mob_combat@test": {
        enabled: true,
      },
    });

    registerObject(object);
    loadSchemeImplementation(SchemeMobCombat);

    const state: ISchemeMobCombatState = SchemeMobCombat.activate(object, ini, EScheme.MOB_COMBAT, "mob_combat@test");

    expect(state.logic).toEqualLuaTables(getConfigSwitchConditions(ini, "mob_combat@test")!);
    expect(state.enabled).toBe(true);
    expect(state.action).toBeInstanceOf(MobCombatManager);
    assertSchemeSubscribedToManager(state, MobCombatManager);
  });

  it("should correctly disable", () => {
    const object: GameObject = MockGameObject.mock();
    const ini: IniFile = MockIniFile.mock("test.ltx", {
      "mob_combat@test": {
        enabled: true,
      },
    });

    registerObject(object);
    loadSchemeImplementation(SchemeMobCombat);

    const state: ISchemeMobCombatState = SchemeMobCombat.activate(object, ini, EScheme.MOB_COMBAT, "mob_combat@test");

    expect(state.enabled).toBe(true);

    SchemeMobCombat.disable(object, EScheme.MOB_COMBAT);
    expect(state.enabled).toBe(false);
  });
});
