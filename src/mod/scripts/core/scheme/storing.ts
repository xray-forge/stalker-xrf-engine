import { time_global, XR_CTime, XR_game_object, XR_net_packet, XR_reader } from "xray16";

import { STRINGIFIED_NIL } from "@/mod/globals/lua";
import { Optional, StringOptional, TName, TNumberId, TPath, TSection, TTimestamp } from "@/mod/lib/types";
import { IRegistryObjectState, registry } from "@/mod/scripts/core/database";
import { pstor_load_all, pstor_save_all } from "@/mod/scripts/core/database/pstor";
import { ESchemeEvent } from "@/mod/scripts/core/scheme/base";
import { issueSchemeEvent } from "@/mod/scripts/core/scheme/issueSchemeEvent";
import { setLoadMarker, setSaveMarker } from "@/mod/scripts/utils/game_save";
import { readCTimeFromPacket, writeCTimeToPacket } from "@/mod/scripts/utils/time";

/**
 * todo;
 * todo;
 * todo;
 */
export function saveLogic(object: XR_game_object, packet: XR_net_packet): void {
  const objectId: TNumberId = object.id();
  const now: TTimestamp = time_global();

  let activation_time: TTimestamp = registry.objects.get(objectId).activation_time;

  if (!activation_time) {
    activation_time = 0;
  }

  packet.w_s32(activation_time - now);

  writeCTimeToPacket(packet, registry.objects.get(objectId).activation_game_time);
}

/**
 * todo;
 * todo;
 * todo;
 */
export function loadLogic(obj: XR_game_object, reader: XR_reader): void {
  const npc_id = obj.id();
  const cur_tm = time_global();

  registry.objects.get(npc_id).activation_time = reader.r_s32() + cur_tm;
  registry.objects.get(npc_id).activation_game_time = readCTimeFromPacket(reader) as XR_CTime;
}

/**
 * todo;
 * todo;
 * todo;
 */
export function saveObject(object: XR_game_object, packet: XR_net_packet): void {
  setSaveMarker(packet, false, "object" + object.name());

  const objectId: TNumberId = object.id();
  const state: IRegistryObjectState = registry.objects.get(objectId);

  if (state.job_ini) {
    packet.w_stringZ(state.job_ini);
  } else {
    packet.w_stringZ("");
  }

  if (state.ini_filename) {
    packet.w_stringZ(state.ini_filename);
  } else {
    packet.w_stringZ("");
  }

  if (state.section_logic) {
    packet.w_stringZ(state.section_logic);
  } else {
    packet.w_stringZ("");
  }

  if (state.active_section) {
    packet.w_stringZ(state.active_section);
  } else {
    packet.w_stringZ("");
  }

  if (state.gulag_name) {
    packet.w_stringZ(state.gulag_name);
  } else {
    packet.w_stringZ("");
  }

  saveLogic(object, packet);

  if (state.active_scheme) {
    issueSchemeEvent(object, state[state.active_scheme!]!, ESchemeEvent.SAVE);
  }

  pstor_save_all(object, packet);
  setSaveMarker(packet, true, "object" + object.name());
}

/**
 * todo;
 * todo;
 * todo;
 */
export function loadObject(obj: XR_game_object, reader: XR_reader): void {
  setLoadMarker(reader, false, "object" + obj.name());

  const objectId: TNumberId = obj.id();
  const state: IRegistryObjectState = registry.objects.get(objectId);
  let job_ini: Optional<TPath> = reader.r_stringZ();

  if (job_ini === "") {
    job_ini = null;
  }

  let iniFilename: Optional<TName> = reader.r_stringZ();

  if (iniFilename === "") {
    iniFilename = null;
  }

  let section_logic: Optional<TSection> = reader.r_stringZ();

  if (section_logic === "") {
    section_logic = null;
  }

  let active_section: StringOptional = reader.r_stringZ();

  if (active_section === "") {
    active_section = STRINGIFIED_NIL;
  }

  const gulag_name: TName = reader.r_stringZ();

  state.job_ini = job_ini;
  state.loaded_ini_filename = iniFilename;
  state.loaded_section_logic = section_logic;
  state.loaded_active_section = active_section;
  state.loaded_gulag_name = gulag_name;

  loadLogic(obj, reader);

  pstor_load_all(obj, reader);
  setLoadMarker(reader, true, "object" + obj.name());
}
