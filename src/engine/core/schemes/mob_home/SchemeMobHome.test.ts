import { describe, expect, it } from "@jest/globals";

import { IRegistryObjectState, registerObject, registry } from "@/engine/core/database";
import { ISchemeMobHomeState } from "@/engine/core/schemes/mob_home/ISchemeMobHomeState";
import { SchemeMobHome } from "@/engine/core/schemes/mob_home/SchemeMobHome";
import { ClientObject, EScheme, ESchemeType, IniFile } from "@/engine/lib/types";
import { loadSchemeImplementation } from "@/engine/scripts/register/schemes_registrator";
import { mockClientGameObject, mockIniFile } from "@/fixtures/xray";

describe("SchemeMobHome functionality", () => {
  it("should be correctly defined", () => {
    expect(SchemeMobHome.SCHEME_SECTION).toBe("mob_home");
    expect(SchemeMobHome.SCHEME_SECTION).toBe(EScheme.MOB_HOME);
    expect(SchemeMobHome.SCHEME_TYPE).toBe(ESchemeType.MONSTER);
  });

  it("should correctly activate scheme", () => {
    const object: ClientObject = mockClientGameObject();
    const ini: IniFile = mockIniFile("test.ltx", {
      "mob_home@test": {
        on_info: "{=actor_in_zone(zat_b42_warning_space_restrictor)} mob_home@1",
        on_info1: "{=actor_in_zone(zat_b42_warning_space_restrictor)} mob_home@1",
        gulag_point: true,
        aggressive: true,
        path_home: "test-name",
        home_min_radius: 13,
        home_mid_radius: 15,
        home_max_radius: 18,
      },
    });

    registerObject(object);
    loadSchemeImplementation(SchemeMobHome);

    SchemeMobHome.activate(object, ini, SchemeMobHome.SCHEME_SECTION, `${SchemeMobHome.SCHEME_SECTION}@test`, "prefix");

    const state: IRegistryObjectState = registry.objects.get(object.id());
    const schemeState: ISchemeMobHomeState = state[EScheme.MOB_HOME] as ISchemeMobHomeState;

    expect(schemeState.ini).toBe(ini);
    expect(schemeState.scheme).toBe("mob_home");
    expect(schemeState.section).toBe("mob_home@test");
    expect(schemeState.logic?.length()).toBe(2);
    expect(schemeState.actions?.length()).toBe(1);

    expect(schemeState.homeWayPoint).toBe("prefix_test-name");
    expect(schemeState.monsterState).toBeNull();
    expect(schemeState.isSmartTerrainPoint).toBe(true);
    expect(schemeState.homeMinRadius).toBe(13);
    expect(schemeState.homeMidRadius).toBe(15);
    expect(schemeState.homeMaxRadius).toBe(18);
  });
});
