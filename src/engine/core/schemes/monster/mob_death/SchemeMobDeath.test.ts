import { describe, expect, it } from "@jest/globals";

import { IRegistryObjectState, registerObject } from "@/engine/core/database";
import { ISchemeMobDeathState } from "@/engine/core/schemes/monster/mob_death/ISchemeMobDeathState";
import { MobDeathManager } from "@/engine/core/schemes/monster/mob_death/MobDeathManager";
import { SchemeMobDeath } from "@/engine/core/schemes/monster/mob_death/SchemeMobDeath";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini";
import { loadSchemeImplementation } from "@/engine/core/utils/scheme";
import { ClientObject, EScheme, IniFile } from "@/engine/lib/types";
import { MockLuaTable } from "@/fixtures/lua";
import { mockClientGameObject, mockIniFile } from "@/fixtures/xray";

describe("SchemeMobDeath", () => {
  it("should correctly activate", () => {
    const object: ClientObject = mockClientGameObject();
    const state: IRegistryObjectState = registerObject(object);
    const ini: IniFile = mockIniFile("test.ltx", {
      "mob_death@test": {
        on_info: "{=actor_in_zone(zat_b42_warning_space_restrictor)} mob_home@1",
        on_info1: "{=actor_in_zone(zat_b42_warning_space_restrictor)} mob_home@1",
      },
    });

    loadSchemeImplementation(SchemeMobDeath);

    SchemeMobDeath.activate(object, ini, EScheme.MOB_DEATH, "mob_death@test");

    const schemeState: ISchemeMobDeathState = state[EScheme.MOB_DEATH] as ISchemeMobDeathState;

    expect(schemeState.logic).toEqualLuaTables(getConfigSwitchConditions(ini, "mob_death@test")!);
    expect((schemeState.actions as unknown as MockLuaTable).getKeysArray()[0]).toBeInstanceOf(MobDeathManager);
  });
});
