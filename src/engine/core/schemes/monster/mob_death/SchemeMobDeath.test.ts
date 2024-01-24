import { describe, expect, it } from "@jest/globals";

import { registerObject } from "@/engine/core/database";
import { ISchemeMobDeathState } from "@/engine/core/schemes/monster/mob_death/mob_death_types";
import { MobDeathManager } from "@/engine/core/schemes/monster/mob_death/MobDeathManager";
import { SchemeMobDeath } from "@/engine/core/schemes/monster/mob_death/SchemeMobDeath";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini";
import { loadSchemeImplementation } from "@/engine/core/utils/scheme";
import { EScheme, GameObject, IniFile } from "@/engine/lib/types";
import { assertSchemeSubscribedToManager } from "@/fixtures/engine";
import { MockGameObject, MockIniFile } from "@/fixtures/xray";

describe("SchemeMobDeath", () => {
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
