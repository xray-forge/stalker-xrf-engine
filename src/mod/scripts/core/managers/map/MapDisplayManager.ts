import {
  alife,
  game,
  level,
  time_global,
  XR_alife_simulator,
  XR_cse_alife_object,
  XR_game_object,
  XR_vector,
} from "xray16";

import { captions } from "@/mod/globals/captions";
import { info_portions } from "@/mod/globals/info_portions/info_portions";
import { levels } from "@/mod/globals/levels";
import { STRINGIFIED_FALSE, STRINGIFIED_NIL, STRINGIFIED_TRUE } from "@/mod/globals/lua";
import { npc_map_marks, TMapMark } from "@/mod/globals/npc_map_marks";
import {
  EScheme,
  Maybe,
  Optional,
  TDistance,
  TDuration,
  TLabel,
  TNumberId,
  TSection,
  TTimestamp,
} from "@/mod/lib/types";
import { IRegistryObjectState, registry } from "@/mod/scripts/core/database";
import { AbstractCoreManager } from "@/mod/scripts/core/managers/AbstractCoreManager";
import {
  anomalyScannerObjects,
  mapNpcMarks,
  primaryMapSpotObjects,
  sleepZones,
} from "@/mod/scripts/core/managers/map/MapDisplayManagerObjects";
import { anomalyHasArtefact } from "@/mod/scripts/utils/alife";
import { getConfigString, pickSectionFromCondList } from "@/mod/scripts/utils/configs";
import { getStoryObjectId } from "@/mod/scripts/utils/ids";
import { hasAlifeInfo } from "@/mod/scripts/utils/info_portions";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { parseConditionsList, TConditionList } from "@/mod/scripts/utils/parse";

const logger: LuaLogger = new LuaLogger("MapDisplayManager");

/**
 * todo;
 */
export class MapDisplayManager extends AbstractCoreManager {
  public static readonly DISTANCE_TO_SHOW_MAP_MARKS: TDistance = 75;
  public static readonly UPDATES_THROTTLE: TDuration = 10_000;

  public isInitialized: boolean = false;
  public lastUpdateAt: TTimestamp = 0;

  /**
   * todo;
   */
  public updateObjectMapSpot(
    object: XR_game_object,
    scheme: EScheme,
    state: IRegistryObjectState,
    section: TSection
  ): void {
    logger.info("Update npc spot:", object.name());

    const npcId: TNumberId = object.id();
    const sim: XR_alife_simulator = alife();

    if (!sim) {
      return;
    }

    let spotSection;

    if (scheme === null || scheme === STRINGIFIED_NIL) {
      spotSection = getConfigString(state.ini, state.section_logic, "show_spot", object, false, "");
    } else {
      spotSection = getConfigString(state.ini, section, "show_spot", object, false, "");
    }

    if (spotSection === null) {
      spotSection = STRINGIFIED_TRUE;
    }

    const actor: XR_game_object = registry.actor;
    let mapSpot: Optional<TMapMark> = getConfigString(
      state.ini,
      state.section_logic,
      "level_spot",
      object,
      false,
      ""
    ) as TMapMark;

    if (mapSpot === null) {
      mapSpot = getConfigString(state.ini!, section, "level_spot", object, false, "") as TMapMark;
    }

    if (mapSpot !== null) {
      const spotConditionList: TConditionList = parseConditionsList(object, section, "level_spot", mapSpot);

      mapSpot = pickSectionFromCondList(actor, object, spotConditionList);
    }

    const spot_condlist = parseConditionsList(object, section, "show_spot", spotSection);
    const spot: TSection = pickSectionFromCondList(actor, object, spot_condlist)!;
    const obj: Optional<XR_cse_alife_object> = sim.object(object.id());

    if (obj?.online) {
      obj.visible_for_map(spot !== STRINGIFIED_FALSE);

      if (mapSpot !== null) {
        const descriptor = mapNpcMarks[mapSpot];

        if (level.map_has_object_spot(npcId, descriptor.map_location) !== 0) {
          level.map_remove_object_spot(npcId, descriptor.map_location);
        }

        if (actor && object && object.general_goodwill(actor) > -1000) {
          level.map_add_object_spot(npcId, descriptor.map_location, descriptor.hint);
        }
      } else {
        Object.values(npc_map_marks).forEach((it) => {
          if (level.map_has_object_spot(npcId, it) !== 0) {
            level.map_remove_object_spot(npcId, it);
          }
        });
      }
    }
  }

  /**
   * todo;
   */
  public removeObjectMapSpot(object: XR_game_object, state: IRegistryObjectState): void {
    logger.info("Remove object spot:", object.name());

    const sim: XR_alife_simulator = alife();

    if (!sim) {
      return;
    }

    const objectId: Maybe<TNumberId> = sim.object(object.id())?.id;
    let mapSpot: Optional<TMapMark> = getConfigString<TMapMark>(
      state.ini,
      state.section_logic,
      "level_spot",
      object,
      false,
      ""
    ) as TMapMark;

    // todo: Retry, probably not needed at all.
    if (mapSpot === null) {
      mapSpot = getConfigString<TMapMark>(state.ini, state.active_section, "level_spot", object, false, "") as TMapMark;
    }

    if (mapSpot !== null) {
      const actor: XR_game_object = registry.actor;
      const mapSpotConditionsList: TConditionList = parseConditionsList(
        object,
        state.active_section!,
        "level_spot",
        mapSpot
      );

      mapSpot = pickSectionFromCondList(actor, object, mapSpotConditionsList);
    }

    if (objectId && (mapSpot as string) !== "" && mapSpot !== null) {
      const descriptor = mapNpcMarks[mapSpot];

      if (level.map_has_object_spot(objectId, descriptor.map_location) !== 0) {
        level.map_remove_object_spot(objectId, descriptor.map_location);
      }
    }
  }

  /**
   * todo;
   */
  public update(): void {
    const now: TTimestamp = time_global();

    if (!this.isInitialized) {
      this.updatePrimaryObjectsDisplay();
      this.isInitialized = true;
    }

    if (now - this.lastUpdateAt >= MapDisplayManager.UPDATES_THROTTLE) {
      this.updateSleepZonesDisplay();
      this.lastUpdateAt = now;
    }
  }

  /**
   * todo;
   */
  public updatePrimaryObjectsDisplay(): void {
    primaryMapSpotObjects.forEach((it) => {
      const objectId: Optional<TNumberId> = getStoryObjectId(it.target);

      if (objectId) {
        level.map_add_object_spot(objectId, "primary_object", it.hint);
      }
    });

    this.updateAnomalyZonesDisplay();
    this.updateSleepZonesDisplay();
  }

  /**
   * todo;
   */
  public updateSleepZonesDisplay(): void {
    for (const [index, sleepZone] of sleepZones) {
      const objectId: Optional<TNumberId> = getStoryObjectId(sleepZone.target);
      const storedObject: Optional<IRegistryObjectState> = objectId ? registry.objects.get(objectId) : null;

      if (objectId && storedObject && storedObject.object) {
        const actorPosition: XR_vector = registry.actor.position();
        const distanceFromActor: TDistance = storedObject.object.position().distance_to(actorPosition);
        const hasSleepSpot: boolean =
          level.map_has_object_spot(objectId, npc_map_marks.ui_pda2_actor_sleep_location) !== 0;

        if (distanceFromActor <= MapDisplayManager.DISTANCE_TO_SHOW_MAP_MARKS && !hasSleepSpot) {
          level.map_add_object_spot(objectId, npc_map_marks.ui_pda2_actor_sleep_location, sleepZone.hint);
        } else if (distanceFromActor > MapDisplayManager.DISTANCE_TO_SHOW_MAP_MARKS && hasSleepSpot) {
          level.map_remove_object_spot(objectId, npc_map_marks.ui_pda2_actor_sleep_location);
        }
      }
    }
  }

  /**
   * todo;
   */
  public updateAnomalyZonesDisplay(): void {
    if (hasAlifeInfo(info_portions.jup_b32_scanner_reward)) {
      for (const [index, scanner] of anomalyScannerObjects) {
        scanner.enabled = hasAlifeInfo(scanner.group);
      }
    }

    /**
     * Update artefacts loot display in zones with artefacts.
     * Works for jupiter only.
     */
    if (level.name() === levels.jupiter) {
      for (const [index, scanner] of anomalyScannerObjects) {
        if (scanner.enabled) {
          const objectId: Optional<number> = getStoryObjectId(scanner.target);

          let hint: TLabel = game.translate_string(scanner.hint) + "\\n" + " \\n";
          const actor: XR_game_object = registry.actor;

          const [hasArtefact, artefactTable] = anomalyHasArtefact(actor, null, [scanner.zone, null]);

          if (hasArtefact) {
            hint = hint + game.translate_string(captions.st_jup_b32_has_af);
            for (const [k, v] of artefactTable!) {
              hint = hint + "\\n" + game.translate_string("st_" + v + "_name");
            }
          } else {
            hint = hint + game.translate_string(captions.st_jup_b32_no_af);
          }

          /**
           * Add artifacts info in hotspots.
           */
          if (objectId && level.map_has_object_spot(objectId, "primary_object") !== 0) {
            level.map_remove_object_spot(objectId, "primary_object");
            level.map_add_object_spot(objectId, "primary_object", hint);
          }
        }
      }
    }
  }
}
