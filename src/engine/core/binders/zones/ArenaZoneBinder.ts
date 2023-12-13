import { callback, clsid, LuabindClass, object_binder } from "xray16";

import {
  closeLoadMarker,
  closeSaveMarker,
  openLoadMarker,
  openSaveMarker,
  registerZone,
  registry,
  unregisterZone,
} from "@/engine/core/database";
import { LuaLogger } from "@/engine/core/utils/logging";
import { ACTOR_ID } from "@/engine/lib/constants/ids";
import {
  AlifeSimulator,
  GameObject,
  NetPacket,
  Optional,
  Reader,
  ServerObject,
  TCount,
  TNumberId,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Binder for arena zone restrictor game object.
 */
@LuabindClass()
export class ArenaZoneBinder extends object_binder {
  public savedObjects: LuaTable<TNumberId, boolean> = new LuaTable();

  public override net_spawn(object: ServerObject): boolean {
    if (!super.net_spawn(object)) {
      return false;
    }

    registerZone(this.object);

    this.object.set_callback(callback.zone_enter, this.onEnterArenaZone, this);
    this.object.set_callback(callback.zone_exit, this.onExitArenaZone, this);

    return true;
  }

  public override net_destroy(): void {
    this.object.set_callback(callback.zone_enter, null);
    this.object.set_callback(callback.zone_exit, null);

    unregisterZone(this.object);

    super.net_destroy();
  }

  public override save(packet: NetPacket): void {
    openSaveMarker(packet, ArenaZoneBinder.__name);

    super.save(packet);

    packet.w_u8(table.size(this.savedObjects));

    for (const [id] of this.savedObjects) {
      packet.w_u16(id);
    }

    closeSaveMarker(packet, ArenaZoneBinder.__name);
  }

  public override load(reader: Reader): void {
    openLoadMarker(reader, ArenaZoneBinder.__name);

    super.load(reader);

    const count: TCount = reader.r_u8();

    for (const _ of $range(1, count)) {
      this.savedObjects.set(reader.r_u16(), true);
    }

    closeLoadMarker(reader, ArenaZoneBinder.__name);
  }

  /**
   * Purge memoized items that entered arena and should be reset for next fight/scenario.
   */
  public purgeItems(): void {
    const simulator: AlifeSimulator = registry.simulator;

    for (const [id] of this.savedObjects) {
      simulator.release(simulator.object(id), true);
    }

    this.savedObjects = new LuaTable();
  }

  /**
   * todo: Description.
   */
  public onEnterArenaZone(zone: GameObject, object: GameObject): void {
    if (
      object.id() === ACTOR_ID ||
      object.clsid() === clsid.obj_physic ||
      object.clsid() === clsid.hanging_lamp ||
      object.clsid() === clsid.obj_phys_destroyable
    ) {
      return;
    }

    this.savedObjects.set(object.id(), true);
  }

  /**
   * todo: Description.
   */
  public onExitArenaZone(zone: GameObject, object: GameObject): void {
    if (
      object.id() === ACTOR_ID ||
      object.clsid() === clsid.obj_physic ||
      object.clsid() === clsid.hanging_lamp ||
      object.clsid() === clsid.obj_phys_destroyable
    ) {
      return;
    }

    this.savedObjects.delete(object.id());
  }
}
