import { beforeEach, describe, expect, it } from "@jest/globals";

import { IRegistryObjectState, registerObject } from "@/engine/core/database";
import { HelicopterMoveManager } from "@/engine/core/schemes/helicopter/heli_move/HelicopterMoveManager";
import { ISchemeHelicopterMoveState } from "@/engine/core/schemes/helicopter/heli_move/ISchemeHelicopterMoveState";
import { SchemeHelicopterMove } from "@/engine/core/schemes/helicopter/heli_move/SchemeHelicopterMove";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini";
import { loadSchemeImplementation } from "@/engine/core/utils/scheme";
import { EScheme, ESchemeType, GameObject, IniFile } from "@/engine/lib/types";
import { assertSchemeSubscribedToManager, resetRegistry } from "@/fixtures/engine";
import { MockGameObject, mockIniFile } from "@/fixtures/xray";

describe("SchemeHelicopterMove", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should be correctly defined", () => {
    expect(SchemeHelicopterMove.SCHEME_SECTION).toBe("heli_move");
    expect(SchemeHelicopterMove.SCHEME_SECTION).toBe(EScheme.HELI_MOVE);
    expect(SchemeHelicopterMove.SCHEME_TYPE).toBe(ESchemeType.HELICOPTER);
  });

  it("should correctly activate with defaults", () => {
    const object: GameObject = MockGameObject.mock();
    const ini: IniFile = mockIniFile("test.ltx", {
      "heli_move@test": {
        path_move: "test_path",
        max_velocity: 4000,
      },
    });
    const state: IRegistryObjectState = registerObject(object);

    loadSchemeImplementation(SchemeHelicopterMove);

    const schemeState: ISchemeHelicopterMoveState = SchemeHelicopterMove.activate(
      object,
      ini,
      EScheme.HELI_MOVE,
      "heli_move@test"
    );

    assertSchemeSubscribedToManager(schemeState, HelicopterMoveManager);

    expect(state.invulnerable).toBe(false);
    expect(state.immortal).toBe(false);
    expect(state.mute).toBe(false);

    expect(schemeState.logic).toEqualLuaTables({});
    expect(schemeState.path_move).toBe("test_path");
    expect(schemeState.path_look).toBeNull();
    expect(schemeState.enemy_).toBeNull();
    expect(schemeState.fire_point).toBeNull();
    expect(schemeState.max_velocity).toBe(4000);
    expect(schemeState.max_mgun_dist).toBeNull();
    expect(schemeState.max_rocket_dist).toBeNull();
    expect(schemeState.min_mgun_dist).toBeNull();
    expect(schemeState.min_rocket_dist).toBeNull();
    expect(schemeState.upd_vis).toBe(10);
    expect(schemeState.use_rocket).toBe(true);
    expect(schemeState.use_mgun).toBe(true);
    expect(schemeState.engine_sound).toBe(true);
    expect(schemeState.stop_fire).toBe(false);
    expect(schemeState.show_health).toBe(false);
    expect(schemeState.fire_trail).toBe(false);
  });

  it("should correctly activate with provided data", () => {
    const object: GameObject = MockGameObject.mock();
    const ini: IniFile = mockIniFile("test.ltx", {
      "heli_move@test": {
        on_info: "{+test} first, second",
        path_move: "test_path2",
        path_look: "test_path3",
        fire_point: "test_point",
        max_velocity: 500,
        max_mgun_attack_dist: 600,
        min_mgun_attack_dist: 655,
        max_rocket_attack_dist: 700,
        min_rocket_attack_dist: 400,
        upd_vis: 555,
        enemy: "enemy_test",
        use_mgun: false,
        use_rocket: false,
        engine_sound: false,
        stop_fire: true,
        show_health: true,
        fire_trail: true,
      },
    });
    const state: IRegistryObjectState = registerObject(object);

    loadSchemeImplementation(SchemeHelicopterMove);

    const schemeState: ISchemeHelicopterMoveState = SchemeHelicopterMove.activate(
      object,
      ini,
      EScheme.HELI_MOVE,
      "heli_move@test"
    );

    expect(state.invulnerable).toBe(false);
    expect(state.immortal).toBe(false);
    expect(state.mute).toBe(false);

    expect(schemeState.logic).toEqualLuaTables(getConfigSwitchConditions(ini, "heli_move@test"));
    expect(schemeState.path_move).toBe("test_path2");
    expect(schemeState.path_look).toBe("test_path3");
    expect(schemeState.enemy_).toBe("enemy_test");
    expect(schemeState.fire_point).toBe("test_point");
    expect(schemeState.max_velocity).toBe(500);
    expect(schemeState.max_mgun_dist).toBe(600);
    expect(schemeState.max_rocket_dist).toBe(700);
    expect(schemeState.min_mgun_dist).toBe(655);
    expect(schemeState.min_rocket_dist).toBe(400);
    expect(schemeState.upd_vis).toBe(555);
    expect(schemeState.use_rocket).toBe(false);
    expect(schemeState.use_mgun).toBe(false);
    expect(schemeState.engine_sound).toBe(false);
    expect(schemeState.stop_fire).toBe(true);
    expect(schemeState.show_health).toBe(true);
    expect(schemeState.fire_trail).toBe(true);
  });
});
