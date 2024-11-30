import { jest } from "@jest/globals";

import { SmartTerrain } from "@/engine/core/objects/smart_terrain/SmartTerrain";
import { IniFile, Optional, TName, TSection } from "@/engine/lib/types";
import { MockIniFile } from "@/fixtures/xray";

/**
 * Smart terrain mocked server object.
 */
export class MockSmartTerrain extends SmartTerrain {
  public static mock(name: Optional<TName> = null, section: TSection = "test_smart_section"): SmartTerrain {
    const terrain: MockSmartTerrain = new MockSmartTerrain(section);

    terrain.ini = terrain.spawn_ini() as IniFile;

    if (name) {
      jest.spyOn(terrain, "name").mockImplementation(() => name);
    }

    return terrain;
  }

  public static mockRegistered(name: Optional<TName> = null, section: TSection = "test_smart_section"): SmartTerrain {
    const terrain: MockSmartTerrain = MockSmartTerrain.mock(name, section);

    terrain.on_before_register();
    terrain.on_register();

    return terrain;
  }

  public static mockConfigured(name: TName = "test_smart", section: TSection = "test_smart_section"): SmartTerrain {
    const terrain: SmartTerrain = new SmartTerrain(section);

    jest.spyOn(terrain, "spawn_ini").mockImplementation(() => {
      return MockIniFile.mock(`${name}_config.ltx`, {
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

    terrain.ini = terrain.spawn_ini() as IniFile;
    jest.spyOn(terrain, "name").mockImplementation(() => name);

    return terrain;
  }
}
