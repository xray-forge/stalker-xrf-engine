import { describe, expect, it } from "@jest/globals";
import { GameObject, IniFile } from "xray16/alias";
import { MockGameObject, MockIniFile } from "xray16/mocks";

import { registerObject } from "@/engine/core/database";
import { MonsterManager } from "@/engine/core/schemes/restrictor/sr_monster/MonsterManager";
import { SchemeMonster } from "@/engine/core/schemes/restrictor/sr_monster/SchemeMonster";
import { ISchemeMonsterState } from "@/engine/core/schemes/restrictor/sr_monster/sr_monster_types";
import { loadSchemeImplementation } from "@/engine/core/schemes/runtime";
import { EScheme, ESchemeType } from "@/engine/core/schemes/types";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini";
import { assertSchemeSubscribedToManager } from "@/fixtures/engine";

describe("SchemeMonster", () => {
  it("should be correctly defined", () => {
    expect(SchemeMonster.SCHEME_SECTION).toBe("sr_monster");
    expect(SchemeMonster.SCHEME_SECTION).toBe(EScheme.SR_MONSTER);
    expect(SchemeMonster.SCHEME_TYPE).toBe(ESchemeType.RESTRICTOR);
  });

  it("should correctly activate scheme with defaults", () => {
    const object: GameObject = MockGameObject.mock();
    const ini: IniFile = MockIniFile.mock("test.ltx", {
      "sr_monster@test": {
        on_info: "{=actor_in_zone(zat_b42_warning_space_restrictor)} mob_home@1",
        on_info1: "{=actor_in_zone(zat_b42_warning_space_restrictor)} mob_home@1",
      },
    });

    registerObject(object);
    loadSchemeImplementation(SchemeMonster);

    const state: ISchemeMonsterState = SchemeMonster.activate(
      object,
      ini,
      SchemeMonster.SCHEME_SECTION,
      `${SchemeMonster.SCHEME_SECTION}@test`
    );

    expect(state.ini).toBe(ini);
    expect(state.scheme).toBe("sr_monster");
    expect(state.section).toBe("sr_monster@test");
    expect(state.logic?.length()).toBe(2);
    expect(state.actions?.length()).toBe(1);
    expect(state.soundObject).toBeNull();
    expect(state.delay).toBe(0);
    expect(state.idle).toBe(300_000);
    expect(state.pathTable).toEqualLuaTables({});
    expect(state.monster).toBeNull();
    expect(state.soundSlideVel).toBe(7);

    assertSchemeSubscribedToManager(state, MonsterManager);
  });

  it("should correctly activate scheme with custom values", () => {
    const object: GameObject = MockGameObject.mock();
    const ini: IniFile = MockIniFile.mock("test.ltx", {
      "sr_monster@test": {
        on_info: "{=actor_in_zone(zat_b42_warning_space_restrictor)} sr_monster@1",
        snd: "test-snd",
        delay: 15,
        idle: 2,
        sound_path: "a, b, c, d",
        monster_section: "boar",
        slide_velocity: 5,
      },
    });

    registerObject(object);
    loadSchemeImplementation(SchemeMonster);

    const state: ISchemeMonsterState = SchemeMonster.activate(
      object,
      ini,
      SchemeMonster.SCHEME_SECTION,
      `${SchemeMonster.SCHEME_SECTION}@test`
    );

    expect(state.ini).toBe(ini);
    expect(state.scheme).toBe("sr_monster");
    expect(state.section).toBe("sr_monster@test");
    expect(state.logic).toEqualLuaTables(getConfigSwitchConditions(ini, "sr_monster@test"));
    expect(state.soundObject).toBe("test-snd");
    expect(state.delay).toBe(15);
    expect(state.idle).toBe(20_000);
    expect(state.pathTable).toEqualLuaArrays(["a", "b", "c", "d"]);
    expect(state.monster).toBe("boar");
    expect(state.soundSlideVel).toBe(5);

    assertSchemeSubscribedToManager(state, MonsterManager);
  });
});
