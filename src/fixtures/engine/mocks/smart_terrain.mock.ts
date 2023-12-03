import { jest } from "@jest/globals";

import { SmartTerrain } from "@/engine/core/objects/smart_terrain/SmartTerrain";
import { TName, TSection } from "@/engine/lib/types";
import { mockIniFile } from "@/fixtures/xray";

/**
 * Mock smart terrain mocked server object.
 */
export class MockSmartTerrain extends SmartTerrain {
  public static mock(name: TName = "test_smart", section: TSection = "test_smart_section"): SmartTerrain {
    const smartTerrain: MockSmartTerrain = new MockSmartTerrain(section);

    smartTerrain.ini = smartTerrain.spawn_ini();
    jest.spyOn(smartTerrain, "name").mockImplementation(() => name);

    return smartTerrain;
  }
}

/**
 * Mock smart terrain server object.
 *
 * @deprecated
 */
export function mockSmartTerrain(name: TName = "test_smart", section: TSection = "test_smart_section"): SmartTerrain {
  const smartTerrain: SmartTerrain = new SmartTerrain(section);

  smartTerrain.ini = smartTerrain.spawn_ini();
  jest.spyOn(smartTerrain, "name").mockImplementation(() => name);

  return smartTerrain;
}

/**
 * Mock smart terrain server object.
 */
export function mockSmartTerrainWithConfiguration(
  name: TName = "test_smart",
  section: TSection = "test_smart_section"
): SmartTerrain {
  const smartTerrain: SmartTerrain = new SmartTerrain(section);

  jest.spyOn(smartTerrain, "spawn_ini").mockImplementation(() => {
    return mockIniFile(`${name}_config.ltx`, {
      [name]: {},
      smart_terrain: {
        sim_type: "default",
        squad_id: 404,
        mutant_lair: false,
        no_mutant: true,
        forbidden_point: false,
        def_restr: `${name}_def_restr`,
        att_restr: `${name}_att_restr`,
        safe_restr: `${name}_safe_restr`,
        spawn_point: `${name}_spawn_point`,
        arrive_dist: 30,
        max_population: 5,
        respawn_only_smart: false,
        respawn_params: "respawn_params_section",
        smart_control: "smart_control_section",
      },
      respawn_params_section: {
        test_squad_novice: "3",
        test_squad_master: "1",
      },
      test_squad_novice: {
        spawn_num: 2,
        spawn_squads: 3,
      },
      test_squad_master: {
        spawn_num: 4,
        spawn_squads: 1,
      },
      smart_control_section: {
        noweap_zone: `${name}_no_weapon_zone`,
      },
    });
  });

  smartTerrain.ini = smartTerrain.spawn_ini();
  jest.spyOn(smartTerrain, "name").mockImplementation(() => name);

  return smartTerrain;
}
