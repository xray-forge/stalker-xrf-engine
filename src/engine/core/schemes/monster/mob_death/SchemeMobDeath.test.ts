import { describe, expect, it } from "@jest/globals";
import { GameObject, IniFile } from "xray16/alias";
import { MockGameObject, MockIniFile } from "xray16/mocks";

import { registerObject } from "@/engine/core/database";
import { ISchemeMobDeathState } from "@/engine/core/schemes/monster/mob_death/mob_death_types";
import { MobDeathManager } from "@/engine/core/schemes/monster/mob_death/MobDeathManager";
import { SchemeMobDeath } from "@/engine/core/schemes/monster/mob_death/SchemeMobDeath";
import { loadSchemeImplementation } from "@/engine/core/schemes/runtime";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini";
import { EScheme, ESchemeType } from "@/engine/lib/types";
import { assertSchemeSubscribedToManager } from "@/fixtures/engine";

describe("SchemeMobDeath", () => {
  it("should be correctly defined", () => {
    expect(SchemeMobDeath.SCHEME_SECTION).toBe("mob_death");
    expect(SchemeMobDeath.SCHEME_SECTION).toBe(EScheme.MOB_DEATH);
    expect(SchemeMobDeath.SCHEME_TYPE).toBe(ESchemeType.MONSTER);
  });

  it("should correctly activate", () => {
    const object: GameObject = MockGameObject.mock();
    const ini: IniFile = MockIniFile.mock("test.ltx", {
      "mob_death@test": {
        on_info: "{=actor_in_zone(zat_b42_warning_space_restrictor)} mob_home@1",
        on_info1: "{=actor_in_zone(zat_b42_warning_space_restrictor)} mob_home@1",
      },
    });

    registerObject(object);
    loadSchemeImplementation(SchemeMobDeath);

    const schemeState: ISchemeMobDeathState = SchemeMobDeath.activate(object, ini, EScheme.MOB_DEATH, "mob_death@test");

    expect(schemeState.logic).toEqualLuaTables(getConfigSwitchConditions(ini, "mob_death@test")!);

    assertSchemeSubscribedToManager(schemeState, MobDeathManager);
  });
});
