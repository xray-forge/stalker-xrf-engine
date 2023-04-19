import { clsid } from "xray16";

import { SIMULATION_OBJECTS_PROPS_LTX } from "@/engine/core/database/ini";
import { registry } from "@/engine/core/database/registry";
import { TSimulationObject } from "@/engine/core/objects/server/types";
import { parseConditionsList } from "@/engine/core/utils/parse";
import { ACTOR, DEFAULT } from "@/engine/lib/constants/words";
import { TCount, TSection } from "@/engine/lib/types";

/**
 * todo;
 */
export function registerSimulationObject(object: TSimulationObject): void {
  initializeSimulationObjectProperties(object);
  updateSimulationObjectAvailability(object);
}

/**
 * todo;
 */
export function unregisterSimulationObject(object: TSimulationObject): void {
  registry.simulationObjects.delete(object.id);
}

/**
 * todo;
 */
export function updateSimulationObjectAvailability(object: TSimulationObject): void {
  if (object.isSimulationAvailable()) {
    registry.simulationObjects.set(object.id, object);
  } else {
    registry.simulationObjects.delete(object.id);
  }
}

/**
 * todo;
 */
export function initializeSimulationObjectProperties(simulationObject: TSimulationObject): void {
  simulationObject.props = new LuaTable();

  let section: TSection =
    simulationObject.clsid() === clsid.online_offline_group_s
      ? simulationObject.section_name()
      : simulationObject.name();

  if (!SIMULATION_OBJECTS_PROPS_LTX.section_exist(section)) {
    if (simulationObject.clsid() === clsid.online_offline_group_s) {
      section = "default_squad";
    } else if (simulationObject.clsid() === clsid.script_actor) {
      section = ACTOR;
    } else {
      section = DEFAULT;
    }
  }

  const propertiesCount: TCount = SIMULATION_OBJECTS_PROPS_LTX.line_count(section);

  for (const it of $range(0, propertiesCount - 1)) {
    const [, propertyName, propertyValue] = SIMULATION_OBJECTS_PROPS_LTX.r_line(section, it, "", "");

    // todo: Once configs are updated, make some shared / full constant name.
    if (propertyName === "sim_avail") {
      simulationObject.isSimulationAvailableConditionList = parseConditionsList(propertyValue);
    } else {
      simulationObject.props[propertyName] = propertyValue;
    }
  }
}
