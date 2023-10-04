import { AbstractManager } from "@/engine/core/managers/base";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { Stalker } from "@/engine/core/objects/server/creature";
import { isStalker } from "@/engine/core/utils/class_ids";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Manager to handle random items spawning for each stalker in game.
 */
export class LoadoutManager extends AbstractManager {
  public override initialize(): void {
    const eventsManager: EventsManager = EventsManager.getInstance();

    eventsManager.registerCallback(EGameEvent.STALKER_SPAWN, this.onStalkerSpawn, this);
  }

  public override destroy(): void {
    const eventsManager: EventsManager = EventsManager.getInstance();

    eventsManager.unregisterCallback(EGameEvent.STALKER_SPAWN, this.onStalkerSpawn);
  }

  public onStalkerSpawn(stalker: Stalker): void {
    // Skip other possible entries.
    if (!isStalker(stalker)) {
      return;
    }

    logger.format("Stalker spawn: %s / %s", stalker.name(), stalker.clsid());
  }
}
