import {
  alife,
  callback,
  clsid,
  LuabindClass,
  object_binder,
  XR_alife_simulator,
  XR_cse_alife_object,
  XR_game_object,
  XR_net_packet,
  XR_reader,
} from "xray16";

import { closeLoadMarker, closeSaveMarker, openSaveMarker, registry } from "@/engine/core/database";
import { openLoadMarker } from "@/engine/core/database/save_markers";
import { LuaLogger } from "@/engine/core/utils/logging";
import { getTableSize } from "@/engine/core/utils/table";
import { TNumberId } from "@/engine/lib/types";

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

  public constructor(object: XR_game_object) {
    super(object);
    arena_zones.set(object.name(), this);
  }

  /**
   * todo: Description.
   */
  public override net_spawn(object: XR_cse_alife_object): boolean {
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
    const simulator: XR_alife_simulator = alife();

    for (const [k, v] of this.savedObjects) {
      const object = simulator.object(k);

      simulator.release(object, true);
    }
  }

  /**
   * todo: Description.
   */
  public override save(packet: XR_net_packet): void {
    super.save(packet);

    openSaveMarker(packet, ArenaZoneBinder.__name);

    packet.w_u8(getTableSize(this.savedObjects));

    for (const [k, v] of this.savedObjects) {
      packet.w_u16(k);
    }

    closeSaveMarker(packet, ArenaZoneBinder.__name);
  }

  /**
   * todo: Description.
   */
  public override load(reader: XR_reader): void {
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
  public on_enter(zone: XR_game_object, object: XR_game_object): void {
    if (
      object.id() === registry.actor.id() ||
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
  public on_exit(zone: XR_game_object, object: XR_game_object): void {
    if (
      object.id() === registry.actor.id() ||
      object.clsid() === clsid.obj_physic ||
      object.clsid() === clsid.hanging_lamp ||
      object.clsid() === clsid.obj_phys_destroyable
    ) {
      return;
    }

    this.savedObjects.delete(object.id());
  }
}
