import { XR_game_object, XR_net_packet, XR_reader } from "xray16";

import { Maybe, Optional } from "@/mod/lib/types";
import { registry } from "@/mod/scripts/core/db/registry";
import { abort } from "@/mod/scripts/utils/debug";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("pstor");

const pstor_number = 0;
const pstor_string = 1;
const pstor_boolean = 2;

/**
 * todo;
 * todo;
 * todo;
 */
export function pstor_is_registered_type(tv: unknown): boolean {
  return !(tv !== "boolean" && tv !== "string" && tv !== "number");
}

/**
 * todo;
 * todo;
 * todo;
 */
export function pstor_store<T>(object: XR_game_object, varname: string, val: T): void {
  const npc_id = object.id();

  if (registry.objects.get(npc_id).pstor === null) {
    registry.objects.get(npc_id).pstor = new LuaTable();
  }

  const tv = type(val);

  if (val !== null && !pstor_is_registered_type(tv)) {
    abort("db/pstor: pstor_store: !registered type '%s' encountered, %s", tv, varname);
  }

  registry.objects.get(npc_id)!.pstor!.set(varname, val);
}

/**
 * todo;
 * todo;
 * todo;
 */
export function pstor_retrieve<T>(obj: XR_game_object, varname: string): Optional<T>;
export function pstor_retrieve<T>(obj: XR_game_object, varname: string, defval: T): T;
export function pstor_retrieve<T>(obj: XR_game_object, varname: string, defval?: T): Optional<T> {
  const npc_id = obj.id();

  if (registry.objects.get(npc_id).pstor !== null) {
    const val = registry.objects.get(npc_id).pstor!.get(varname);

    if (val !== null) {
      return val;
    }
  }

  if (defval !== null) {
    return defval as T;
  }

  // --abort("db/pstor: pstor_retrieve: variable '%s' does !exist", varname)
  return null;
}

/**
 * todo;
 * todo;
 * todo;
 */
export function pstor_save_all(obj: XR_game_object, packet: XR_net_packet): void {
  const npc_id = obj.id();
  let pstor: Maybe<LuaTable<string>> = registry.objects.get(npc_id).pstor;

  if (!pstor) {
    pstor = new LuaTable<string>();
    registry.objects.get(npc_id).pstor = pstor;
  }

  let ctr: number = 0;

  for (const [k, v] of pstor) {
    ctr = ctr + 1;
  }

  packet.w_u32(ctr);

  for (const [k, v] of pstor) {
    packet.w_stringZ(k);

    const tv = type(v);

    if (tv === "number") {
      packet.w_u8(pstor_number);
      packet.w_float(v);
    } else if (tv === "string") {
      packet.w_u8(pstor_string);
      packet.w_stringZ(v);
    } else if (tv === "boolean") {
      packet.w_u8(pstor_boolean);
      packet.w_bool(v);
    } else {
      abort("db/pstor: pstor_save_all: !registered type '%s' encountered", tv);
    }
  }
}

/**
 * todo
 * todo
 * todo
 * todo
 */
export function pstor_load_all(obj: XR_game_object, reader: XR_reader) {
  const npc_id = obj.id();
  let pstor = registry.objects.get(npc_id).pstor;

  if (!pstor) {
    pstor = new LuaTable();
    registry.objects.get(npc_id).pstor = pstor;
  }

  const ctr = reader.r_u32();

  for (const i of $range(1, ctr)) {
    const varname = reader.r_stringZ();
    const tn = reader.r_u8();

    if (tn === pstor_number) {
      pstor.set(varname, reader.r_float());
    } else if (tn === pstor_string) {
      pstor.set(varname, reader.r_stringZ());
    } else if (tn === pstor_boolean) {
      pstor.set(varname, reader.r_bool());
    } else {
      abort("db/pstor: pstor_load_all: !registered type N %d encountered", tn);
    }
  }
}
