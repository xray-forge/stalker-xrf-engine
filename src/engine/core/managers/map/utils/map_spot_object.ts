import { level } from "xray16";

import { IRegistryObjectState, registry } from "@/engine/core/database";
import { IMapMarkDescriptor } from "@/engine/core/managers/map";
import { mapDisplayConfig } from "@/engine/core/managers/map/MapDisplayConfig";
import { parseConditionsList, pickSectionFromCondList, readIniString } from "@/engine/core/utils/ini";
import { LuaLogger } from "@/engine/core/utils/logging";
import { mapMarks } from "@/engine/lib/constants/map_marks";
import { FALSE, NIL, TRUE } from "@/engine/lib/constants/words";
import {
  AlifeSimulator,
  EScheme,
  GameObject,
  Optional,
  ServerObject,
  TName,
  TNumberId,
  TSection,
  TStringId,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Update map display for game object.
 *
 * @param object - game object
 * @param scheme - active logic scheme
 * @param state - target object registry state
 * @param section - active logic section
 */
export function updateObjectMapSpot(
  object: GameObject,
  scheme: EScheme,
  state: IRegistryObjectState,
  section: TSection
): void {
  const actor: GameObject = registry.actor;
  const simulator: Optional<AlifeSimulator> = registry.simulator;

  if (!simulator) {
    return;
  }

  const serverObject: Optional<ServerObject> = simulator.object(object.id());

  if (serverObject?.online) {
    const objectId: TNumberId = object.id();
    const isSpotVisibleSection: TSection =
      (!scheme || scheme === NIL
        ? readIniString(state.ini, state.sectionLogic, "show_spot")
        : readIniString(state.ini, section, "show_spot")) ?? TRUE;
    const isSpotVisible: TSection = pickSectionFromCondList(actor, object, parseConditionsList(isSpotVisibleSection))!;

    let mapSpot: Optional<TName> =
      readIniString(state.ini, state.sectionLogic, "level_spot") ?? readIniString(state.ini, section, "level_spot");

    if (mapSpot) {
      mapSpot = pickSectionFromCondList(actor, object, parseConditionsList(mapSpot));
    }

    serverObject.visible_for_map(isSpotVisible !== FALSE);

    if (mapSpot) {
      const descriptor: IMapMarkDescriptor = mapDisplayConfig.MAP_MARKS.get(mapSpot);

      if (level.map_has_object_spot(objectId, descriptor.icon) !== 0) {
        level.map_remove_object_spot(objectId, descriptor.icon);
      }

      if (object.general_goodwill(actor) > -1000) {
        level.map_add_object_spot(objectId, descriptor.icon, descriptor.hint);
      }
    } else {
      // Is it really needed?

      Object.values(mapMarks).forEach((it) => {
        if (level.map_has_object_spot(objectId, it) !== 0) {
          level.map_remove_object_spot(objectId, it);
        }
      });
    }
  }
}

/**
 * Remove object map spot display.
 *
 * @param object - game object
 */
export function removeObjectMapSpot(object: GameObject): void {
  logger.info("Remove object spot: %s", object.name());

  if (!registry.simulator) {
    return;
  }

  const state: IRegistryObjectState = registry.objects.get(object.id());
  const spot: Optional<TStringId> = pickSectionFromCondList(
    registry.actor,
    object,
    parseConditionsList(
      readIniString(state.ini, state.sectionLogic, "level_spot") ??
        readIniString(state.ini, state.activeSection, "level_spot") ??
        ""
    )
  );

  if (spot && spot !== "") {
    level.map_remove_object_spot(object.id(), mapDisplayConfig.MAP_MARKS.get(spot).icon);
  }
}
