import { time_global, TXR_net_processor, XR_CTime, XR_game_object, XR_net_packet } from "xray16";

import {
  closeLoadMarker,
  closeSaveMarker,
  IRegistryObjectState,
  loadPortableStore,
  openSaveMarker,
  registry,
  savePortableStore,
} from "@/engine/core/database";
import { openLoadMarker } from "@/engine/core/database/save_markers";
import { ESchemeEvent, IBaseSchemeState } from "@/engine/core/schemes";
import { emitSchemeEvent } from "@/engine/core/schemes/base/utils";
import { readCTimeFromPacket, writeCTimeToPacket } from "@/engine/core/utils/time";
import { NIL } from "@/engine/lib/constants/words";
import { Optional, StringOptional, TName, TNumberId, TPath, TSection, TTimestamp } from "@/engine/lib/types";

/**
 * todo;
 * todo;
 * todo;
 */
function saveSchemeActivationDetails(object: XR_game_object, packet: XR_net_packet): void {
  const objectId: TNumberId = object.id();
  const now: TTimestamp = time_global();

  let activationTime: Optional<TTimestamp> = registry.objects.get(objectId).activation_time;

  if (activationTime === null) {
    activationTime = 0;
  }

  packet.w_s32(activationTime - now);
  writeCTimeToPacket(packet, registry.objects.get(objectId).activation_game_time);
}

/**
 * todo;
 * todo;
 * todo;
 */
function loadSchemeActivationDetails(object: XR_game_object, reader: TXR_net_processor): void {
  const objectId: TNumberId = object.id();
  const now: TTimestamp = time_global();

  registry.objects.get(objectId).activation_time = reader.r_s32() + now;
  registry.objects.get(objectId).activation_game_time = readCTimeFromPacket(reader) as XR_CTime;
}

/**
 * todo;
 * todo;
 * todo;
 */
export function saveObjectLogic(object: XR_game_object, packet: XR_net_packet): void {
  const objectId: TNumberId = object.id();
  const state: IRegistryObjectState = registry.objects.get(objectId);

  openSaveMarker(packet, "object" + object.name());

  packet.w_stringZ(state.job_ini ? state.job_ini : "");
  packet.w_stringZ(state.ini_filename ? state.ini_filename : "");
  packet.w_stringZ(state.section_logic ? state.section_logic : "");
  packet.w_stringZ(state.active_section ? state.active_section : "");
  packet.w_stringZ(state.gulag_name ? state.gulag_name : "");

  saveSchemeActivationDetails(object, packet);

  if (state.active_scheme) {
    emitSchemeEvent(object, state[state.active_scheme] as IBaseSchemeState, ESchemeEvent.SAVE);
  }

  savePortableStore(object, packet);
  closeSaveMarker(packet, "object" + object.name());
}

/**
 * todo;
 * todo;
 * todo;
 */
export function loadObjectLogic(object: XR_game_object, reader: TXR_net_processor): void {
  const objectId: TNumberId = object.id();
  const state: IRegistryObjectState = registry.objects.get(objectId);

  openLoadMarker(reader, "object" + object.name());

  const jobIni: Optional<TPath> = reader.r_stringZ();
  const iniFilename: Optional<TName> = reader.r_stringZ();
  const sectionLogic: Optional<TSection> = reader.r_stringZ();
  const activeSection: StringOptional = reader.r_stringZ();
  const gulagName: TName = reader.r_stringZ();

  state.job_ini = jobIni === "" ? null : jobIni;
  state.loaded_ini_filename = iniFilename === "" ? null : iniFilename;
  state.loaded_section_logic = sectionLogic === "" ? null : sectionLogic;
  state.loaded_active_section = activeSection === "" ? NIL : activeSection;
  state.loaded_gulag_name = gulagName;

  loadSchemeActivationDetails(object, reader);
  loadPortableStore(object, reader);

  closeLoadMarker(reader, "object" + object.name());
}
