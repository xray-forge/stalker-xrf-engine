import { describe, expect, it } from "@jest/globals";

import { registerObject } from "@/engine/core/database";
import { ISchemeMobHomeState } from "@/engine/core/schemes/monster/mob_home/mob_home_types";
import { MobHomeManager } from "@/engine/core/schemes/monster/mob_home/MobHomeManager";
import { SchemeMobHome } from "@/engine/core/schemes/monster/mob_home/SchemeMobHome";
import { loadSchemeImplementation } from "@/engine/core/utils/scheme/scheme_setup";
import { EScheme, ESchemeType, GameObject, IniFile } from "@/engine/lib/types";
import { assertSchemeSubscribedToManager } from "@/fixtures/engine";
import { MockGameObject, mockIniFile } from "@/fixtures/xray";

describe("SchemeMobHome functionality", () => {
  it("should be correctly defined", () => {
    expect(SchemeMobHome.SCHEME_SECTION).toBe("mob_home");
    expect(SchemeMobHome.SCHEME_SECTION).toBe(EScheme.MOB_HOME);
    expect(SchemeMobHome.SCHEME_TYPE).toBe(ESchemeType.MONSTER);
  });

  it("should correctly activate scheme", () => {
    const object: GameObject = MockGameObject.mock();
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

    const state: ISchemeMobHomeState = SchemeMobHome.activate(
      object,
      ini,
      SchemeMobHome.SCHEME_SECTION,
      `${SchemeMobHome.SCHEME_SECTION}@test`,
      "prefix"
    );

    expect(state.ini).toBe(ini);
    expect(state.scheme).toBe("mob_home");
    expect(state.section).toBe("mob_home@test");
    expect(state.logic?.length()).toBe(2);
    expect(state.actions?.length()).toBe(1);

    expect(state.homeWayPoint).toBe("prefix_test-name");
    expect(state.monsterState).toBeNull();
    expect(state.isSmartTerrainPoint).toBe(true);
    expect(state.homeMinRadius).toBe(13);
    expect(state.homeMidRadius).toBe(15);
    expect(state.homeMaxRadius).toBe(18);

    assertSchemeSubscribedToManager(state, MobHomeManager);
  });
});
