import { alife, clsid } from "xray16";
import { IniFile } from "xray16/alias";
import { ACTOR, DEFAULT, DEFAULT_SQUAD, TCount, TSection } from "xray16/lib";

import { registry } from "@/engine/core/database/registry";
import { parseConditionsList } from "@/engine/core/ini";
import { TSimulationObject } from "@/engine/core/managers/simulation";
import { SIMULATION_OBJECTS_PROPERTIES_LTX } from "@/engine/core/managers/simulation/SimulationConfig";
import { isSquad } from "@/engine/core/utils/class_ids";

/**
 * Register simulator instance in the registry.
 */
export function registerSimulator(): void {
  registry.simulator = alife();
}

/**
 * Register simulation object in registries for participation in game events.
 *
 * @param object - Simulation object to register.
 */
export function registerSimulationObject(object: TSimulationObject): void {
  initializeSimulationObjectProperties(object);
  updateSimulationObjectAvailability(object);
}

/**
 * Unregister object in simulation registries.
 *
 * @param object - Simulation object to register.
 */
export function unregisterSimulationObject(object: TSimulationObject): void {
  registry.simulationObjects.delete(object.id);
}

/**
 * Update simulation object participation.
 * If object can participate, store it in global registry.
 *
 * @param object - Simulation object to update availability status.
 */
export function updateSimulationObjectAvailability(object: TSimulationObject): void {
  if (object.isSimulationAvailable()) {
    registry.simulationObjects.set(object.id, object);
  } else {
    registry.simulationObjects.delete(object.id);
  }
}

/**
 * Initialize simulation object properties.
 *
 * @param object - Simulation object to initialize simulation configuration.
 * @param ini - Ini configuration file to read properties from.
 */
export function initializeSimulationObjectProperties(
  object: TSimulationObject,
  ini: IniFile = SIMULATION_OBJECTS_PROPERTIES_LTX
): void {
  object.simulationProperties = new LuaTable();

  let section: TSection = isSquad(object) ? object.section_name() : object.name();

  if (!ini.section_exist(section)) {
    switch (object.clsid()) {
      case clsid.online_offline_group_s:
        section = DEFAULT_SQUAD;
        break;

      case clsid.script_actor:
        section = ACTOR;
        break;

      default:
        section = DEFAULT;
        break;
    }
  }

  const count: TCount = ini.line_count(section);

  for (const it of $range(0, count - 1)) {
    const [, name, value] = ini.r_line(section, it, "", "");

    // todo: Once configs are updated, make some shared / full constant name.
    if (name === "sim_avail") {
      object.isSimulationAvailableConditionList = parseConditionsList(value);
    } else {
      object.simulationProperties.set(name, tonumber(value) ?? 0);
    }
  }
}
