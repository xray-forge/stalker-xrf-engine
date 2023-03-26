import { LuabindClass, object_binder, XR_cse_alife_object, XR_net_packet, XR_reader } from "xray16";

import {
  closeLoadMarker,
  closeSaveMarker,
  IRegistryObjectState,
  openSaveMarker,
  registerZone,
  registry,
  resetObject,
  unregisterZone,
} from "@/engine/core/database";
import { loadObjectLogic, saveObjectLogic } from "@/engine/core/database/logic";
import { openLoadMarker } from "@/engine/core/database/save_markers";
import { GlobalSoundManager } from "@/engine/core/managers/GlobalSoundManager";
import { ESchemeEvent } from "@/engine/core/schemes";
import { emitSchemeEvent } from "@/engine/core/schemes/base/utils";
import { initializeObjectSchemeLogic } from "@/engine/core/schemes/base/utils/initializeObjectSchemeLogic";
import { LuaLogger } from "@/engine/core/utils/logging";
import { Optional, TDuration, TNumberId } from "@/engine/lib/types";
import { ESchemeType, TSection } from "@/engine/lib/types/scheme";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class RestrictorBinder extends object_binder {
  public isInitialized: boolean = false;
  public isLoaded: boolean = false;
  public state!: IRegistryObjectState;

  /**
   * todo: Description.
   */
  public override reinit(): void {
    super.reinit();
    this.state = resetObject(this.object);
  }

  /**
   * todo: Description.
   */
  public override net_spawn(object: XR_cse_alife_object): boolean {
    if (!super.net_spawn(object)) {
      return false;
    }

    logger.info("Net spawn:", this.object.name());

    registerZone(this.object);

    const objectId: TNumberId = this.object.id();
    const globalSoundManager: GlobalSoundManager = GlobalSoundManager.getInstance();

    if (registry.sounds.looped.get(objectId) !== null) {
      for (const [k, v] of registry.sounds.looped.get(objectId)) {
        globalSoundManager.playLoopedSound(objectId, k);
      }
    }

    return true;
  }

  /**
   * todo: Description.
   */
  public override net_destroy(): void {
    logger.info("Net destroy:", this.object.name());

    GlobalSoundManager.getInstance().stopSoundByObjectId(this.object.id());

    const state: IRegistryObjectState = this.state;

    if (state.active_scheme !== null) {
      emitSchemeEvent(this.object, state[state.active_scheme!]!, ESchemeEvent.NET_DESTROY);
    }

    unregisterZone(this.object);

    registry.objects.delete(this.object.id());
    super.net_destroy();
  }

  /**
   * todo: Description.
   */
  public override update(delta: TDuration): void {
    const activeSection: Optional<TSection> = this.state.active_section as Optional<TSection>;
    const objectId: TNumberId = this.object.id();

    if (!this.isInitialized) {
      this.isInitialized = true;

      initializeObjectSchemeLogic(this.object, this.state, this.isLoaded, registry.actor, ESchemeType.RESTRICTOR);
    }

    this.object.info_clear();

    if (activeSection !== null) {
      this.object.info_add("section: " + activeSection);
    }

    this.object.info_add("name: [" + this.object.name() + "] id [" + objectId + "]");

    if (this.state.active_section !== null) {
      emitSchemeEvent(this.object, this.state[this.state.active_scheme!]!, ESchemeEvent.UPDATE, delta);
    }

    GlobalSoundManager.getInstance().update(objectId);
  }

  /**
   * todo: Description.
   */
  public override net_save_relevant(): boolean {
    return true;
  }

  /**
   * todo: Description.
   */
  public override save(packet: XR_net_packet): void {
    openSaveMarker(packet, RestrictorBinder.__name);

    super.save(packet);
    saveObjectLogic(this.object, packet);

    closeSaveMarker(packet, RestrictorBinder.__name);
  }

  /**
   * todo: Description.
   */
  public override load(reader: XR_reader): void {
    this.isLoaded = true;

    openLoadMarker(reader, RestrictorBinder.__name);

    super.load(reader);
    loadObjectLogic(this.object, reader);

    closeLoadMarker(reader, RestrictorBinder.__name);
  }
}
