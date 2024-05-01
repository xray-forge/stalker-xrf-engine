import { time_global } from "xray16";

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
import { GameObject, TTimestamp } from "@/engine/lib/types";

/**
 * Manager handling display of objects on game map in PDA.
 */
export class MapDisplayManager extends AbstractManager {
  public isInitialized: boolean = false;
  public nextUpdateAt: TTimestamp = -1;

  public override initialize(): void {
    const eventsManager: EventsManager = getManager(EventsManager);

    eventsManager.registerCallback(EGameEvent.ACTOR_UPDATE, this.update, this);
    eventsManager.registerCallback(EGameEvent.STALKER_DEATH, this.onStalkerDeath, this);
  }

  public override destroy(): void {
    const eventsManager: EventsManager = getManager(EventsManager);

    eventsManager.unregisterCallback(EGameEvent.ACTOR_UPDATE, this.update);
    eventsManager.unregisterCallback(EGameEvent.STALKER_DEATH, this.onStalkerDeath);
  }

  public override update(): void {
    const now: TTimestamp = time_global();

    if (!this.isInitialized) {
      this.nextUpdateAt = now + mapDisplayConfig.DISPLAY_UPDATE_THROTTLE;
      this.isInitialized = true;

      updateAnomalyZonesDisplay();
      updateSleepZonesDisplay();
      updateTerrainsMapSpotDisplay();

      return;
    }

    if (now >= this.nextUpdateAt) {
      this.nextUpdateAt = now + mapDisplayConfig.DISPLAY_UPDATE_THROTTLE;
      updateTerrainsMapSpotDisplay();
      updateSleepZonesDisplay();
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
}
