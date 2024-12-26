import { getManager } from "@/engine/core/database";
import { AbstractManager } from "@/engine/core/managers/abstract";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { mapDisplayConfig } from "@/engine/core/managers/map/MapDisplayConfig";
import {
  removeObjectMapSpot,
  updateAnomalyZonesDisplay,
  updateSleepZonesDisplay,
  updateTerrainsMapSpotDisplay,
} from "@/engine/core/managers/map/utils";
import { AnyObject, GameObject } from "@/engine/lib/types";

/**
 * Manager handling display of objects on game map in PDA.
 */
export class MapDisplayManager extends AbstractManager {
  public isInitialized: boolean = false;

  public override initialize(): void {
    const eventsManager: EventsManager = getManager(EventsManager);

    eventsManager.registerCallback(EGameEvent.DUMP_LUA_DATA, this.onDebugDump, this);
    eventsManager.registerCallback(EGameEvent.ACTOR_UPDATE_5000, this.update, this);
    eventsManager.registerCallback(EGameEvent.STALKER_DEATH, this.onStalkerDeath, this);
  }

  public override destroy(): void {
    const eventsManager: EventsManager = getManager(EventsManager);

    eventsManager.unregisterCallback(EGameEvent.DUMP_LUA_DATA, this.onDebugDump);
    eventsManager.unregisterCallback(EGameEvent.ACTOR_UPDATE_5000, this.update);
    eventsManager.unregisterCallback(EGameEvent.STALKER_DEATH, this.onStalkerDeath);
  }

  /**
   * Throttled update of map display.
   */
  public override update(): void {
    if (this.isInitialized) {
      updateTerrainsMapSpotDisplay();
      updateSleepZonesDisplay();
    } else {
      this.isInitialized = true;

      updateAnomalyZonesDisplay();
      updateSleepZonesDisplay();
      updateTerrainsMapSpotDisplay();
    }
  }

  /**
   * Handle game object death.
   *
   * @param object - game object facing death event
   */
  public onStalkerDeath(object: GameObject): void {
    removeObjectMapSpot(object);
  }

  /**
   * Handle dump data event.
   *
   * @param data - data to dump into file
   */
  public onDebugDump(data: AnyObject): AnyObject {
    data[this.constructor.name] = {
      mapDisplayConfig: mapDisplayConfig,
    };

    return data;
  }
}
