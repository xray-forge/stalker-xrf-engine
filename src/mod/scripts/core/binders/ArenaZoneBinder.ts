import {
  alife,
  callback,
  clsid,
  object_binder,
  XR_alife_simulator,
  XR_cse_alife_object,
  XR_game_object,
  XR_net_packet,
  XR_object_binder,
  XR_reader,
} from "xray16";

import { Optional } from "@/mod/lib/types";
import { getActor } from "@/mod/scripts/core/db";
import { setLoadMarker, setSaveMarker } from "@/mod/scripts/utils/game_saves";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { getTableSize } from "@/mod/scripts/utils/table";

// todo: Move to db.
const arena_zones: LuaTable<string, IArenaZoneBinder> = new LuaTable();
const logger: LuaLogger = new LuaLogger("ArenaZoneBinder");

export interface IArenaZoneBinder extends XR_object_binder {
  saved_obj: LuaTable<number, boolean>;

  purge_items(): void;
  on_exit(zone: XR_game_object, object: XR_game_object): void;
  on_enter(zone: XR_game_object, object: XR_game_object): void;
}

export const ArenaZoneBinder: IArenaZoneBinder = declare_xr_class("ArenaZoneBinder", object_binder, {
  __init(object: XR_game_object): void {
    object_binder.__init(this, object);

    this.saved_obj = new LuaTable();
    arena_zones.set(object.name(), this);
  },
  net_spawn(object: XR_cse_alife_object): boolean {
    if (!object_binder.net_spawn(this, object)) {
      return false;
    }

    this.object.set_callback(callback.zone_enter, this.on_enter, this);
    this.object.set_callback(callback.zone_exit, this.on_exit, this);

    return true;
  },
  net_destroy(): void {
    this.object.set_callback(callback.zone_enter, null);
    this.object.set_callback(callback.zone_exit, null);

    object_binder.net_destroy(this);
  },
  purge_items(): void {
    const sim: XR_alife_simulator = alife();

    for (const [k, v] of this.saved_obj) {
      const obj = sim.object(k);

      sim.release(obj, true);
    }
  },
  save(packet: XR_net_packet): void {
    object_binder.save(this, packet);

    setSaveMarker(packet, false, ArenaZoneBinder.__name);

    packet.w_u8(getTableSize(this.saved_obj));

    for (const [k, v] of this.saved_obj) {
      packet.w_u16(k);
    }

    setSaveMarker(packet, true, ArenaZoneBinder.__name);
  },
  load(reader: XR_reader): void {
    object_binder.load(this, reader);

    setLoadMarker(reader, false, ArenaZoneBinder.__name);

    const num = reader.r_u8();

    for (const i of $range(1, num)) {
      this.saved_obj.set(reader.r_u16(), true);
    }

    setLoadMarker(reader, false, ArenaZoneBinder.__name);
  },
  on_enter(zone: XR_game_object, object: XR_game_object): void {
    if (
      object.id() === getActor()!.id() ||
      object.clsid() === clsid.obj_physic ||
      object.clsid() === clsid.hanging_lamp ||
      object.clsid() === clsid.obj_phys_destroyable
    ) {
      return;
    }

    this.saved_obj.set(object.id(), true);
  },
  on_exit(zone: XR_game_object, object: XR_game_object): void {
    if (
      object.id() === getActor()!.id() ||
      object.clsid() === clsid.obj_physic ||
      object.clsid() === clsid.hanging_lamp ||
      object.clsid() === clsid.obj_phys_destroyable
    ) {
      return;
    }

    this.saved_obj.delete(object.id());
  },
} as IArenaZoneBinder);

export function purge_arena_items(name: string): void {
  logger.info("Purge are zone items:", name);

  const arena_zone: Optional<IArenaZoneBinder> = arena_zones.get(name);

  if (arena_zone !== null) {
    arena_zone.purge_items();
  }
}
