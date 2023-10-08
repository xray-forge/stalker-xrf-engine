import { callback, clsid, LuabindClass, object_binder } from "xray16";

import { closeLoadMarker, closeSaveMarker, openLoadMarker, openSaveMarker, registry } from "@/engine/core/database";
import { LuaLogger } from "@/engine/core/utils/logging";
import { ACTOR_ID } from "@/engine/lib/constants/ids";
import { AlifeSimulator, ClientObject, NetPacket, Reader, ServerObject, TNumberId } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

// todo: Move to db.
// todo: Move to db.
// todo: Move to db.
const arena_zones: LuaTable<string, ArenaZoneBinder> = new LuaTable();

/**
 * todo;
 */
@LuabindClass()
export class ArenaZoneBinder extends object_binder {
  public savedObjects: LuaTable<TNumberId, boolean> = new LuaTable();

  public constructor(object: ClientObject) {
    super(object);
    arena_zones.set(object.name(), this);
  }

  /**
   * todo: Description.
   */
  public override net_spawn(object: ServerObject): boolean {
    if (!super.net_spawn(object)) {
      return false;
    }

    this.object.set_callback(callback.zone_enter, this.on_enter, this);
    this.object.set_callback(callback.zone_exit, this.on_exit, this);

    return true;
  }

  /**
   * todo: Description.
   */
  public override net_destroy(): void {
    this.object.set_callback(callback.zone_enter, null);
    this.object.set_callback(callback.zone_exit, null);

    super.net_destroy();
  }

  /**
   * todo: Description.
   */
  public purge_items(): void {
    const simulator: AlifeSimulator = registry.simulator;

    for (const [k, v] of this.savedObjects) {
      const object = simulator.object(k);

      simulator.release(object, true);
    }
  }

  /**
   * todo: Description.
   */
  public override save(packet: NetPacket): void {
    super.save(packet);

    openSaveMarker(packet, ArenaZoneBinder.__name);

    packet.w_u8(table.size(this.savedObjects));

    for (const [k, v] of this.savedObjects) {
      packet.w_u16(k);
    }

    closeSaveMarker(packet, ArenaZoneBinder.__name);
  }

  /**
   * todo: Description.
   */
  public override load(reader: Reader): void {
    super.load(reader);

    openLoadMarker(reader, ArenaZoneBinder.__name);

    const num = reader.r_u8();

    for (const i of $range(1, num)) {
      this.savedObjects.set(reader.r_u16(), true);
    }

    closeLoadMarker(reader, ArenaZoneBinder.__name);
  }

  /**
   * todo: Description.
   */
  public on_enter(zone: ClientObject, object: ClientObject): void {
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
  public on_exit(zone: ClientObject, object: ClientObject): void {
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
