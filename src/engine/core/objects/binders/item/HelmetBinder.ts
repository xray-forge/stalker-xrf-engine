import { LuabindClass, object_binder } from "xray16";

import {
  closeSaveMarker,
  openLoadMarker,
  openSaveMarker,
  registerObject,
  resetObject,
  unregisterObject,
} from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { LuaLogger } from "@/engine/core/utils/logging";
import { NetPacket, Reader, ServerItemHelmetObject } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Binder for helmet client objects.
 */
@LuabindClass()
export class HelmetBinder extends object_binder {
  public isInitialized: boolean = false;

  public override net_save_relevant(): boolean {
    return true;
  }

  public override net_spawn(object: ServerItemHelmetObject): boolean {
    if (!super.net_spawn(object)) {
      return false;
    }

    registerObject(this.object);

    if (!this.isInitialized) {
      EventsManager.emitEvent(EGameEvent.ITEM_HELMET_GO_ONLINE_FIRST_TIME, this.object, this);
    }

    EventsManager.emitEvent(EGameEvent.ITEM_HELMET_GO_ONLINE, this.object, this);

    this.isInitialized = true;

    return true;
  }

  public override net_destroy(): void {
    EventsManager.emitEvent(EGameEvent.ITEM_HELMET_GO_OFFLINE, this.object, this);

    unregisterObject(this.object);

    super.net_destroy();
  }

  public override reinit(): void {
    super.reinit();

    resetObject(this.object);
  }

  public override save(packet: NetPacket): void {
    openSaveMarker(packet, HelmetBinder.__name);

    super.save(packet);
    packet.w_bool(this.isInitialized);

    closeSaveMarker(packet, HelmetBinder.__name);
  }

  public override load(reader: Reader): void {
    openLoadMarker(reader, HelmetBinder.__name);

    super.load(reader);
    this.isInitialized = reader.r_bool();

    openLoadMarker(reader, HelmetBinder.__name);
  }
}
