import { time_global } from "xray16";

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
import { emitSchemeEvent } from "@/engine/core/utils/scheme/logic";
import { readTimeFromPacket, writeTimeToPacket } from "@/engine/core/utils/time";
import { NIL } from "@/engine/lib/constants/words";
import {
  ClientObject,
  NetPacket,
  NetProcessor,
  Optional,
  StringOptional,
  Time,
  TName,
  TPath,
  TSection,
} from "@/engine/lib/types";

/**
 * Save game object schemes/logic details.
 *
 * @param object - game object to save logic
 * @param packet - net packet to save login into
 */
export function saveObjectLogic(object: ClientObject, packet: NetPacket): void {
  const state: IRegistryObjectState = registry.objects.get(object.id());

  openSaveMarker(packet, "object" + object.name());

  packet.w_stringZ(state.job_ini ? state.job_ini : "");
  packet.w_stringZ(state.ini_filename ? state.ini_filename : "");
  packet.w_stringZ(state.section_logic ? state.section_logic : "");
  packet.w_stringZ(state.activeSection ? state.activeSection : "");
  packet.w_stringZ(state.gulag_name ? state.gulag_name : "");

  packet.w_s32((state.activationTime || 0) - time_global());
  writeTimeToPacket(packet, state.activationGameTime);

  // todo: Active section or active scheme?
  if (state.activeScheme) {
    emitSchemeEvent(object, state[state.activeScheme] as IBaseSchemeState, ESchemeEvent.SAVE);
  }

  savePortableStore(object, packet);
  closeSaveMarker(packet, "object" + object.name());
}

/**
 * Load game object schemes/logic details.
 *
 * @param object - game object to load logic
 * @param reader - reader to load data from
 */
export function loadObjectLogic(object: ClientObject, reader: NetProcessor): void {
  const state: IRegistryObjectState = registry.objects.get(object.id());

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

  state.activationTime = reader.r_s32() + time_global();
  state.activationGameTime = readTimeFromPacket(reader) as Time;

  loadPortableStore(object, reader);

  closeLoadMarker(reader, "object" + object.name());
}
