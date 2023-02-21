import { time_global, XR_game_object, XR_net_packet, XR_reader } from "xray16";

import { Optional, StringOptional } from "@/mod/lib/types";
import { IStoredObject, registry } from "@/mod/scripts/core/database";
import { pstor_load_all, pstor_save_all } from "@/mod/scripts/core/database/pstor";
import { issueEvent } from "@/mod/scripts/core/schemes/issueEvent";
import { setLoadMarker, setSaveMarker } from "@/mod/scripts/utils/game_saves";
import { readCTimeFromPacket, writeCTimeToPacket } from "@/mod/scripts/utils/time";

/**
 * todo;
 * todo;
 * todo;
 */
export function save_logic(obj: XR_game_object, packet: XR_net_packet): void {
  const npc_id = obj.id();
  const cur_tm = time_global();

  let activation_time: number = registry.objects.get(npc_id).activation_time;

  if (!activation_time) {
    activation_time = 0;
  }

  packet.w_s32(activation_time - cur_tm);

  // -- GAMETIME added by Stohe.
  writeCTimeToPacket(packet, registry.objects.get(npc_id).activation_game_time);
}

/**
 * todo;
 * todo;
 * todo;
 */
export function load_logic(obj: XR_game_object, reader: XR_reader): void {
  const npc_id = obj.id();
  const cur_tm = time_global();

  registry.objects.get(npc_id).activation_time = reader.r_s32() + cur_tm;
  registry.objects.get(npc_id).activation_game_time = readCTimeFromPacket(reader);
}

/**
 * todo;
 * todo;
 * todo;
 */
export function save_obj(obj: XR_game_object, packet: XR_net_packet): void {
  setSaveMarker(packet, false, "object" + obj.name());

  const npc_id = obj.id();
  const st = registry.objects.get(npc_id);

  if (st.job_ini) {
    packet.w_stringZ(st.job_ini);
  } else {
    packet.w_stringZ("");
  }

  if (st.ini_filename) {
    packet.w_stringZ(st.ini_filename);
  } else {
    packet.w_stringZ("");
  }

  if (st.section_logic) {
    packet.w_stringZ(st.section_logic);
  } else {
    packet.w_stringZ("");
  }

  if (st.active_section) {
    packet.w_stringZ(st.active_section);
  } else {
    packet.w_stringZ("");
  }

  if (st.gulag_name) {
    packet.w_stringZ(st.gulag_name);
  } else {
    packet.w_stringZ("");
  }

  // --packet.w_s32(st.stype)

  save_logic(obj, packet);

  if (st.active_scheme) {
    issueEvent(obj, registry.objects.get(npc_id)[st.active_scheme], "save");
  }

  pstor_save_all(obj, packet);
  setSaveMarker(packet, true, "object" + obj.name());
}

/**
 * todo;
 * todo;
 * todo;
 */
export function load_obj(obj: XR_game_object, reader: XR_reader): void {
  setLoadMarker(reader, false, "object" + obj.name());

  const npc_id: number = obj.id();
  const st: IStoredObject = registry.objects.get(npc_id);
  let job_ini: Optional<string> = reader.r_stringZ();

  if (job_ini === "") {
    job_ini = null;
  }

  let ini_filename: Optional<string> = reader.r_stringZ();

  if (ini_filename === "") {
    ini_filename = null;
  }

  let section_logic: Optional<string> = reader.r_stringZ();

  if (section_logic === "") {
    section_logic = null;
  }

  let active_section: StringOptional<string> = reader.r_stringZ();

  if (active_section === "") {
    active_section = "nil";
  }

  const gulag_name: string = reader.r_stringZ();

  // --const stype = reader.r_s32()
  st.job_ini = job_ini;
  st.loaded_ini_filename = ini_filename;
  st.loaded_section_logic = section_logic;
  st.loaded_active_section = active_section;
  // --st.loaded_active_scheme = active_scheme
  st.loaded_gulag_name = gulag_name;
  // --st.loaded_stype = stype

  load_logic(obj, reader);

  pstor_load_all(obj, reader);
  setLoadMarker(reader, true, "object" + obj.name());
}
