import { LuabindClass, object_binder } from "xray16";

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
import { GlobalSoundManager } from "@/engine/core/managers/sounds/GlobalSoundManager";
import { ESchemeEvent } from "@/engine/core/schemes";
import { initializeObjectSchemeLogic } from "@/engine/core/schemes/base/utils/initializeObjectSchemeLogic";
import { LuaLogger } from "@/engine/core/utils/logging";
import { emitSchemeEvent } from "@/engine/core/utils/scheme/logic";
import { NetPacket, Reader, ServerObject, TDuration, TNumberId } from "@/engine/lib/types";
import { ESchemeType } from "@/engine/lib/types/scheme";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class RestrictorBinder extends object_binder {
  public isInitialized: boolean = false;
  public isLoaded: boolean = false;
  public state!: IRegistryObjectState;

  public override reinit(): void {
    super.reinit();
    this.state = resetObject(this.object);
  }

  public override net_spawn(object: ServerObject): boolean {
    if (!super.net_spawn(object)) {
      return false;
    }

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

  public override net_destroy(): void {
    GlobalSoundManager.getInstance().stopSoundByObjectId(this.object.id());

    const state: IRegistryObjectState = this.state;

    if (state.active_scheme !== null) {
      emitSchemeEvent(this.object, state[state.active_scheme!]!, ESchemeEvent.NET_DESTROY);
    }

    unregisterZone(this.object);

    registry.objects.delete(this.object.id());
    super.net_destroy();
  }

  public override update(delta: TDuration): void {
    const objectId: TNumberId = this.object.id();

    if (!this.isInitialized) {
      this.isInitialized = true;

      initializeObjectSchemeLogic(this.object, this.state, this.isLoaded, registry.actor, ESchemeType.RESTRICTOR);
    }

    if (this.state.active_section !== null) {
      emitSchemeEvent(this.object, this.state[this.state.active_scheme!]!, ESchemeEvent.UPDATE, delta);
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

    closeSaveMarker(packet, RestrictorBinder.__name);
  }

  public override load(reader: Reader): void {
    this.isLoaded = true;

    openLoadMarker(reader, RestrictorBinder.__name);

    super.load(reader);
    loadObjectLogic(this.object, reader);

    closeLoadMarker(reader, RestrictorBinder.__name);
  }
}
