import { GameObject } from "xray16/alias";
import { abort, extern, Nillable, TName } from "xray16/lib";

import { getSimulationTerrainByName } from "@/engine/core/managers/simulation/utils";
import { ALARM_STATUSES, SmartTerrainControl } from "@/engine/core/objects/smart_terrain";
import { ESmartTerrainStatus } from "@/engine/core/objects/smart_terrain/smart_terrain_types";

/**
 * Check whether smart terrain alarm status matches provided parameters.
 *
 * Where:
 * - terrainName - name of target smart terrain
 * - alarmStatus - status value to check in smart terrain.
 *
 * Throws, if parameters are invalid or target smart terrain is invalid.
 */
extern(
  "xr_conditions.check_smart_alarm_status",
  (_: GameObject, __: GameObject, [terrainName, alarmStatus]: [TName, keyof typeof ALARM_STATUSES]): boolean => {
    const status: Nillable<ESmartTerrainStatus> = ALARM_STATUSES[alarmStatus];

    if (!status) {
      return abort("Wrong status '%s' in 'check_smart_alarm_status' condition.", alarmStatus);
    }

    const terrainControl: Nillable<SmartTerrainControl> = getSimulationTerrainByName(terrainName)
      ?.terrainControl as Nillable<SmartTerrainControl>;

    if (!terrainControl) {
      return abort("Cannot calculate 'check_smart_alarm_status' for terrain '%s'.", terrainName);
    }

    return terrainControl.getSmartTerrainStatus() === status;
  }
);
