import { LuabindClass, object_binder } from "xray16";

import {
  closeLoadMarker,
  closeSaveMarker,
  IRegistryObjectState,
  openLoadMarker,
  openSaveMarker,
  registerZone,
  registry,
  resetObject,
  unregisterZone,
} from "@/engine/core/database";
import { loadObjectLogic, saveObjectLogic } from "@/engine/core/database/logic";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { mapDisplayConfig } from "@/engine/core/managers/map/MapDisplayConfig";
import { GlobalSoundManager } from "@/engine/core/managers/sounds/GlobalSoundManager";
import { soundsConfig } from "@/engine/core/managers/sounds/SoundsConfig";
import { giveInfoPortion } from "@/engine/core/utils/info_portion";
import { LuaLogger } from "@/engine/core/utils/logging";
import { emitSchemeEvent, initializeObjectSchemeLogic } from "@/engine/core/utils/scheme";
import { ESchemeEvent, GameObject, NetPacket, Reader, ServerObject, TDuration, TNumberId } from "@/engine/lib/types";
import { ESchemeType } from "@/engine/lib/types/scheme";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Client side object binder for restrictor zone objects.
 */
@LuabindClass()
export class RestrictorBinder extends object_binder {
  public isInitialized: boolean = false;
  public isLoaded: boolean = false;
  public isVisited: boolean = false;

  public override reinit(): void {
    super.reinit();

    resetObject(this.object);
  }

  public override net_spawn(object: ServerObject): boolean {
    if (!super.net_spawn(object)) {
      return false;
    }

    logger.info("Go online:", this.object.name());

    registerZone(this.object);

    const objectId: TNumberId = this.object.id();

    if (soundsConfig.looped.has(objectId)) {
      const globalSoundManager: GlobalSoundManager = GlobalSoundManager.getInstance();

      for (const [sound] of soundsConfig.looped.get(objectId)) {
        globalSoundManager.playLoopedSound(objectId, sound);
      }
    }

    return true;
  }

  public override net_destroy(): void {
    logger.info("Go offline:", this.object.name());

    GlobalSoundManager.getInstance().stopSoundByObjectId(this.object.id());

    const state: IRegistryObjectState = registry.objects.get(this.object.id());

    if (state.activeScheme !== null) {
      emitSchemeEvent(this.object, state[state.activeScheme!]!, ESchemeEvent.SWITCH_OFFLINE, this.object);
    }

    unregisterZone(this.object);

    super.net_destroy();
  }

  public override update(delta: TDuration): void {
    const object: GameObject = this.object;
    const objectId: TNumberId = object.id();
    const state: IRegistryObjectState = registry.objects.get(objectId);

    if (!this.isInitialized) {
      this.isInitialized = true;

      initializeObjectSchemeLogic(object, state, this.isLoaded, ESchemeType.RESTRICTOR);
    }

    if (!this.isVisited && object.inside(registry.actor.position(), mapDisplayConfig.DISTANCE_TO_OPEN)) {
      logger.info("Visited:", object.name());

      this.isVisited = true;
      giveInfoPortion(string.format("%s_visited", object.name()));
      EventsManager.emitEvent(EGameEvent.RESTRICTOR_ZONE_VISITED, object, this);
    }

    if (state.activeSection !== null) {
      emitSchemeEvent(object, state[state.activeScheme!]!, ESchemeEvent.UPDATE, delta);
    }

    GlobalSoundManager.getInstance().update(objectId);
  }

  public override net_save_relevant(): boolean {
    return true;
  }

  public override save(packet: NetPacket): void {
    openSaveMarker(packet, RestrictorBinder.__name);

    super.save(packet);
    saveObjectLogic(this.object, packet);

    packet.w_bool(this.isVisited);

    closeSaveMarker(packet, RestrictorBinder.__name);
  }

  public override load(reader: Reader): void {
    this.isLoaded = true;

    openLoadMarker(reader, RestrictorBinder.__name);

    super.load(reader);
    loadObjectLogic(this.object, reader);

    this.isVisited = reader.r_bool();

    closeLoadMarker(reader, RestrictorBinder.__name);
  }
}
