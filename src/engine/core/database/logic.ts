import { time_global } from "xray16";

import { IBaseSchemeState, IRegistryObjectState } from "@/engine/core/database/database_types";
import { loadPortableStore, savePortableStore } from "@/engine/core/database/portable_store";
import { registry } from "@/engine/core/database/registry";
import { closeLoadMarker, closeSaveMarker, openLoadMarker, openSaveMarker } from "@/engine/core/database/save_markers";
import { emitSchemeEvent } from "@/engine/core/utils/scheme/scheme_event";
import { readTimeFromPacket, writeTimeToPacket } from "@/engine/core/utils/time";
import { NIL } from "@/engine/lib/constants/words";
import {
  ESchemeEvent,
  GameObject,
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
export function saveObjectLogic(object: GameObject, packet: NetPacket): void {
  const state: IRegistryObjectState = registry.objects.get(object.id());

  openSaveMarker(packet, object.name());

  packet.w_stringZ(state.jobIni ? state.jobIni : "");
  packet.w_stringZ(state.iniFilename ? state.iniFilename : "");
  packet.w_stringZ(state.sectionLogic ? state.sectionLogic : "");
  packet.w_stringZ(state.activeSection ? state.activeSection : "");
  packet.w_stringZ(state.smartTerrainName ? state.smartTerrainName : "");

  packet.w_s32((state.activationTime || 0) - time_global());
  writeTimeToPacket(packet, state.activationGameTime);

  if (state.activeScheme) {
    emitSchemeEvent(state[state.activeScheme] as IBaseSchemeState, ESchemeEvent.SAVE);
  }

  savePortableStore(object.id(), packet);
  closeSaveMarker(packet, object.name());
}

/**
 * Load game object schemes/logic details.
 *
 * @param object - game object to load logic
 * @param reader - reader to load data from
 */
export function loadObjectLogic(object: GameObject, reader: NetProcessor): void {
  const state: IRegistryObjectState = registry.objects.get(object.id());

  openLoadMarker(reader, object.name());

  const jobIni: Optional<TPath> = reader.r_stringZ();
  const iniFilename: Optional<TName> = reader.r_stringZ();
  const sectionLogic: Optional<TSection> = reader.r_stringZ();
  const activeSection: StringOptional = reader.r_stringZ();
  const smartTerrainName: TName = reader.r_stringZ();

  state.jobIni = jobIni === "" ? null : jobIni;
  state.loadedIniFilename = iniFilename === "" ? null : iniFilename;
  state.loadedSectionLogic = sectionLogic === "" ? null : sectionLogic;
  state.loadedActiveSection = activeSection === "" ? NIL : activeSection;
  state.loadedSmartTerrainName = smartTerrainName;

  state.activationTime = reader.r_s32() + time_global();
  state.activationGameTime = readTimeFromPacket(reader) as Time;

  loadPortableStore(object.id(), reader);

  closeLoadMarker(reader, object.name());
}
