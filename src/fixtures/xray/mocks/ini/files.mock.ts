import { config as alifeConfig } from "@/engine/configs/alife";
import { config as forgeConfig } from "@/engine/configs/forge";
import { AnyObject, TPath } from "@/engine/lib/types";
import { mockDefaultWeatherGraphs } from "@/fixtures/xray/mocks/ini/files/default_weather_graphs.ltx.mock";
import { mockDropManager } from "@/fixtures/xray/mocks/ini/files/drop_manager.ltx.mock";
import { mockGame } from "@/fixtures/xray/mocks/ini/files/game.ltx.mock";
import { mockMapDisplayManager } from "@/fixtures/xray/mocks/ini/files/map_display_manager.ltx.mock";
import { mockBoxGeneric } from "@/fixtures/xray/mocks/ini/files/ph_box_generic.ltx.mock";
import { mockScriptSound } from "@/fixtures/xray/mocks/ini/files/script_sound.ltx.mock";
import { mockSimulationObjectsProps } from "@/fixtures/xray/mocks/ini/files/simulation_objects_props.ltx.mock";
import { mockSpawnIni } from "@/fixtures/xray/mocks/ini/files/spawn.ini.mock";
import { mockSquadBehaviours } from "@/fixtures/xray/mocks/ini/files/squad_behaviours.ltx.mock";
import { mockStalkerUpgradeInfo } from "@/fixtures/xray/mocks/ini/files/stalkers_upgrade_info.ltx.mock";
import { mockSurgeManager } from "@/fixtures/xray/mocks/ini/files/surge_manager.ltx.mock";
import { mockSystemIni } from "@/fixtures/xray/mocks/ini/files/system.ini.mock";
import { mockTaskManager } from "@/fixtures/xray/mocks/ini/files/task_manager.ltx.mock";
import { mockTradeGeneric } from "@/fixtures/xray/mocks/ini/files/trade_generic.ltx.mock";
import { mockTradeManager } from "@/fixtures/xray/mocks/ini/files/trade_manager.ltx.mock";
import { mockTravelManager } from "@/fixtures/xray/mocks/ini/files/travel_manager.ltx.mock";
import { mockTreasureManager } from "@/fixtures/xray/mocks/ini/files/treasure_manager.ltx.mock";
import { mockUpgradesLtx } from "@/fixtures/xray/mocks/ini/files/upgrades.ltx.mock";
import { mockUpgradesManager } from "@/fixtures/xray/mocks/ini/files/upgrades_manager.ltx.mock";

/**
 * Mock ini files for testing.
 */
export const FILES_MOCKS: Record<TPath, AnyObject> = {
  "scripts\\dummy.ltx": {},
  "system.ini": mockSystemIni,
  "spawn.ini": mockSpawnIni,
  "game.ltx": mockGame,
  "object_spawn.ini": {},
  "sounds\\script_sound.ltx": mockScriptSound,
  "managers\\drop_manager.ltx": mockDropManager,
  "managers\\surge_manager.ltx": mockSurgeManager,
  "environment\\dynamic_weather_graphs.ltx": mockDefaultWeatherGraphs,
  "managers\\task_manager.ltx": mockTaskManager,
  "misc\\trade\\trade_generic.ltx": mockTradeGeneric,
  "managers\\treasure_manager.ltx": mockTreasureManager,
  "misc\\squad_behaviours.ltx": mockSquadBehaviours,
  "managers\\travel_manager.ltx": mockTravelManager,
  "managers\\trade_manager.ltx": mockTradeManager,
  "managers\\upgrades_manager.ltx": mockUpgradesManager,
  "managers\\map_display_manager.ltx": mockMapDisplayManager,
  "managers\\simulation\\simulation_objects_props.ltx": mockSimulationObjectsProps,
  "alife.ltx": alifeConfig,
  "forge.ltx": forgeConfig,
  "item_upgrades.ltx": mockUpgradesLtx,
  "managers\\upgrades\\stalkers_upgrade_info.ltx": mockStalkerUpgradeInfo,
  "misc\\ph_box_generic.ltx": mockBoxGeneric,
};
