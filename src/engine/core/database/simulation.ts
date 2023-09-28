import { alife, clsid } from "xray16";

import { SIMULATION_OBJECTS_PROPS_LTX } from "@/engine/core/database/ini_registry";
import { registry } from "@/engine/core/database/registry";
import { TSimulationObject } from "@/engine/core/managers/simulation";
import { isSquad } from "@/engine/core/utils/class_ids";
import { parseConditionsList } from "@/engine/core/utils/ini/ini_parse";
import { ACTOR, DEFAULT, DEFAULT_SQUAD } from "@/engine/lib/constants/words";
import { TCount, TSection } from "@/engine/lib/types";

/**
 * Register simulator instance in the registry.
 */
export function registerSimulator(): void {
  registry.simulator = alife();
}

/**
 * Register simulation object in registries for participation in game events.
 *
 * @param object - simulation object to register
 */
export function registerSimulationObject(object: TSimulationObject): void {
  initializeSimulationObjectProperties(object);
  updateSimulationObjectAvailability(object);
}

/**
 * Unregister object in simulation registries.
 *
 * @param object - simulation object to register
 */
export function unregisterSimulationObject(object: TSimulationObject): void {
  registry.simulationObjects.delete(object.id);
}

/**
 * Update simulation object participation.
 * If object can participate, store it in global registry.
 *
 * @param object - simulation object to update availability status
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
 * @param object - simulation object to initialize simulation configuration
 */
export function initializeSimulationObjectProperties(object: TSimulationObject): void {
  object.simulationProperties = new LuaTable();

  let section: TSection = isSquad(object) ? object.section_name() : object.name();

  if (!SIMULATION_OBJECTS_PROPS_LTX.section_exist(section)) {
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

  const count: TCount = SIMULATION_OBJECTS_PROPS_LTX.line_count(section);

  for (const it of $range(0, count - 1)) {
    const [, name, value] = SIMULATION_OBJECTS_PROPS_LTX.r_line(section, it, "", "");

    // todo: Once configs are updated, make some shared / full constant name.
    if (name === "sim_avail") {
      object.isSimulationAvailableConditionList = parseConditionsList(value);
    } else {
      object.simulationProperties.set(name, value);
    }
  }
}
