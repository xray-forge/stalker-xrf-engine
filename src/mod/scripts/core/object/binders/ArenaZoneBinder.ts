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

import { Optional } from "@/mod/lib/types";
import { registry } from "@/mod/scripts/core/database";
import { setLoadMarker, setSaveMarker } from "@/mod/scripts/utils/game_save";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { getTableSize } from "@/mod/scripts/utils/table";

// todo: Move to db.
const arena_zones: LuaTable<string, ArenaZoneBinder> = new LuaTable();
const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class ArenaZoneBinder extends object_binder {
  public saved_obj: LuaTable<number, boolean> = new LuaTable();

  /**
   * todo;
   */
  public constructor(object: XR_game_object) {
    super(object);
    arena_zones.set(object.name(), this);
  }

  /**
   * todo;
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
   * todo;
   */
  public override net_destroy(): void {
    this.object.set_callback(callback.zone_enter, null);
    this.object.set_callback(callback.zone_exit, null);

    super.net_destroy();
  }

  /**
   * todo;
   */
  public purge_items(): void {
    const sim: XR_alife_simulator = alife();

    for (const [k, v] of this.saved_obj) {
      const obj = sim.object(k);

      sim.release(obj, true);
    }
  }

  /**
   * todo;
   */
  public override save(packet: XR_net_packet): void {
    super.save(packet);

    setSaveMarker(packet, false, ArenaZoneBinder.__name);

    packet.w_u8(getTableSize(this.saved_obj));

    for (const [k, v] of this.saved_obj) {
      packet.w_u16(k);
    }

    setSaveMarker(packet, true, ArenaZoneBinder.__name);
  }

  /**
   * todo;
   */
  public override load(reader: XR_reader): void {
    super.load(reader);

    setLoadMarker(reader, false, ArenaZoneBinder.__name);

    const num = reader.r_u8();

    for (const i of $range(1, num)) {
      this.saved_obj.set(reader.r_u16(), true);
    }

    setLoadMarker(reader, false, ArenaZoneBinder.__name);
  }

  /**
   * todo;
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

    this.saved_obj.set(object.id(), true);
  }

  /**
   * todo;
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

    this.saved_obj.delete(object.id());
  }
}

/**
 * todo;
 */
export function purge_arena_items(name: string): void {
  logger.info("Purge are zone items:", name);

  const arena_zone: Optional<ArenaZoneBinder> = arena_zones.get(name);

  if (arena_zone !== null) {
    arena_zone.purge_items();
  }
}
