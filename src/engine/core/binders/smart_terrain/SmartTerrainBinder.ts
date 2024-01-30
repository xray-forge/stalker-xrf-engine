import { LuabindClass, object_binder } from "xray16";

import {
  closeLoadMarker,
  closeSaveMarker,
  getManager,
  openLoadMarker,
  openSaveMarker,
  registerSmartTerrain,
  registry,
  unregisterSmartTerrain,
} from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { mapDisplayConfig } from "@/engine/core/managers/map/MapDisplayConfig";
import { SoundManager } from "@/engine/core/managers/sounds/SoundManager";
import { SmartTerrain } from "@/engine/core/objects/smart_terrain/SmartTerrain";
import { giveInfoPortion } from "@/engine/core/utils/info_portion";
import { LuaLogger } from "@/engine/core/utils/logging";
import { GameObject, NetPacket, NetReader, ServerObject, TDuration } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Client side object binder for smart terrains.
 */
@LuabindClass()
export class SmartTerrainBinder extends object_binder {
  public isVisited: boolean = false;
  public serverObject!: SmartTerrain;

  public override net_spawn(object: ServerObject): boolean {
    if (!super.net_spawn(object)) {
      return false;
    }

    logger.info("Go online: %s", object.name());

    this.serverObject = registry.simulator.object(object.id) as SmartTerrain;

    registerSmartTerrain(this.object, this.serverObject);

    return true;
  }

  public override net_destroy(): void {
    logger.info("Go offline: %s", this.object.name());

    getManager(SoundManager).stop(this.object.id());

    unregisterSmartTerrain(this.object, this.serverObject);

    super.net_destroy();
  }

  public override update(delta: TDuration): void {
    super.update(delta);

    this.serverObject.update();

    const object: GameObject = this.object;

    if (!this.isVisited && object.inside(registry.actor.position(), mapDisplayConfig.DISTANCE_TO_OPEN)) {
      logger.info("Visited: %s", object.name());

      this.isVisited = true;
      giveInfoPortion(string.format("%s_visited", object.name()));
      EventsManager.emitEvent(EGameEvent.SMART_TERRAIN_VISITED, object, this);
    }
  }

  public override net_save_relevant(): boolean {
    return true;
  }

  public override save(packet: NetPacket): void {
    openSaveMarker(packet, SmartTerrainBinder.__name);

    super.save(packet);

    packet.w_bool(this.isVisited);

    closeSaveMarker(packet, SmartTerrainBinder.__name);
  }

  public override load(reader: NetReader): void {
    openLoadMarker(reader, SmartTerrainBinder.__name);

    super.load(reader);

    this.isVisited = reader.r_bool();

    closeLoadMarker(reader, SmartTerrainBinder.__name);
  }
}
