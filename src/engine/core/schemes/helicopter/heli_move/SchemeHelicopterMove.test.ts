import { beforeEach, describe, expect, it } from "@jest/globals";

import { IRegistryObjectState, registerObject } from "@/engine/core/database";
import { ISchemeHelicopterMoveState } from "@/engine/core/schemes/helicopter/heli_move/helicopter_types";
import { HelicopterMoveManager } from "@/engine/core/schemes/helicopter/heli_move/HelicopterMoveManager";
import { SchemeHelicopterMove } from "@/engine/core/schemes/helicopter/heli_move/SchemeHelicopterMove";
import { getConfigSwitchConditions } from "@/engine/core/utils/ini";
import { loadSchemeImplementation } from "@/engine/core/utils/scheme";
import { EScheme, ESchemeType, GameObject, IniFile } from "@/engine/lib/types";
import { assertSchemeSubscribedToManager, resetRegistry } from "@/fixtures/engine";
import { MockGameObject, MockIniFile } from "@/fixtures/xray";

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
    const ini: IniFile = MockIniFile.mock("test.ltx", {
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
    expect(schemeState.pathMove).toBe("test_path");
    expect(schemeState.pathLook).toBeNull();
    expect(schemeState.enemyPreference).toBeNull();
    expect(schemeState.firePoint).toBeNull();
    expect(schemeState.maxVelocity).toBe(4000);
    expect(schemeState.maxMinigunDistance).toBeNull();
    expect(schemeState.maxRocketDistance).toBeNull();
    expect(schemeState.minMinigunDistance).toBeNull();
    expect(schemeState.minRocketDistance).toBeNull();
    expect(schemeState.updVis).toBe(10);
    expect(schemeState.isRocketEnabled).toBe(true);
    expect(schemeState.isMinigunEnabled).toBe(true);
    expect(schemeState.isEngineSoundEnabled).toBe(true);
    expect(schemeState.stopFire).toBe(false);
    expect(schemeState.showHealth).toBe(false);
    expect(schemeState.fireTrail).toBe(false);
  });

  it("should correctly activate with provided data", () => {
    const object: GameObject = MockGameObject.mock();
    const ini: IniFile = MockIniFile.mock("test.ltx", {
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
    expect(schemeState.pathMove).toBe("test_path2");
    expect(schemeState.pathLook).toBe("test_path3");
    expect(schemeState.enemyPreference).toBe("enemy_test");
    expect(schemeState.firePoint).toBe("test_point");
    expect(schemeState.maxVelocity).toBe(500);
    expect(schemeState.maxMinigunDistance).toBe(600);
    expect(schemeState.maxRocketDistance).toBe(700);
    expect(schemeState.minMinigunDistance).toBe(655);
    expect(schemeState.minRocketDistance).toBe(400);
    expect(schemeState.updVis).toBe(555);
    expect(schemeState.isRocketEnabled).toBe(false);
    expect(schemeState.isMinigunEnabled).toBe(false);
    expect(schemeState.isEngineSoundEnabled).toBe(false);
    expect(schemeState.stopFire).toBe(true);
    expect(schemeState.showHealth).toBe(true);
    expect(schemeState.fireTrail).toBe(true);
  });
});
