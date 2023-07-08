import { alife, game, level, time_global } from "xray16";

import { getObjectIdByStoryId, IRegistryObjectState, registry } from "@/engine/core/database";
import { AbstractCoreManager } from "@/engine/core/managers/base/AbstractCoreManager";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import {
  anomalyScannerObjects,
  mapNpcMarks,
  primaryMapSpotObjects,
  sleepZones,
} from "@/engine/core/managers/interface/MapDisplayManagerObjects";
import { parseConditionsList, pickSectionFromCondList, readIniString, TConditionList } from "@/engine/core/utils/ini";
import { LuaLogger } from "@/engine/core/utils/logging";
import { getAnomalyArtefacts } from "@/engine/core/utils/object/object_anomaly";
import { hasAlifeInfo } from "@/engine/core/utils/object/object_info_portion";
import { captions } from "@/engine/lib/constants/captions/captions";
import { infoPortions } from "@/engine/lib/constants/info_portions/info_portions";
import { levels } from "@/engine/lib/constants/levels";
import { EMapMarkType, mapMarks } from "@/engine/lib/constants/map_marks";
import { FALSE, NIL, TRUE } from "@/engine/lib/constants/words";
import {
  AlifeSimulator,
  ClientObject,
  EScheme,
  LuaArray,
  Maybe,
  Optional,
  ServerObject,
  TDistance,
  TDuration,
  TLabel,
  TNumberId,
  TSection,
  TTimestamp,
  Vector,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class MapDisplayManager extends AbstractCoreManager {
  public static readonly DISTANCE_TO_SHOW_MAP_MARKS: TDistance = 75;
  public static readonly UPDATES_THROTTLE: TDuration = 10_000;

  public isInitialized: boolean = false;
  public lastUpdateAt: TTimestamp = 0;

  public override initialize(): void {
    const eventsManager: EventsManager = EventsManager.getInstance();

    eventsManager.registerCallback(EGameEvent.ACTOR_UPDATE, this.update, this);
  }

  public override destroy(): void {
    const eventsManager: EventsManager = EventsManager.getInstance();

    eventsManager.unregisterCallback(EGameEvent.ACTOR_UPDATE, this.update);
  }

  /**
   * todo: Description.
   */
  public updateObjectMapSpot(
    object: ClientObject,
    scheme: EScheme,
    state: IRegistryObjectState,
    section: TSection
  ): void {
    logger.info("Update npc spot:", object.name());

    const objectId: TNumberId = object.id();
    const simulator: AlifeSimulator = alife();

    if (!simulator) {
      return;
    }

    let spotSection;

    if (scheme === null || scheme === NIL) {
      spotSection = readIniString(state.ini, state.sectionLogic, "show_spot", false, "");
    } else {
      spotSection = readIniString(state.ini, section, "show_spot", false, "");
    }

    if (spotSection === null) {
      spotSection = TRUE;
    }

    const actor: ClientObject = registry.actor;
    let mapSpot: Optional<EMapMarkType> = readIniString(
      state.ini,
      state.sectionLogic,
      "level_spot",
      false,
      ""
    ) as EMapMarkType;

    if (mapSpot === null) {
      mapSpot = readIniString(state.ini!, section, "level_spot", false, "") as EMapMarkType;
    }

    if (mapSpot !== null) {
      const spotConditionList: TConditionList = parseConditionsList(mapSpot);

      mapSpot = pickSectionFromCondList(actor, object, spotConditionList);
    }

    const spotConditionsList: TConditionList = parseConditionsList(spotSection);
    const spot: TSection = pickSectionFromCondList(actor, object, spotConditionsList)!;
    const serverObject: Optional<ServerObject> = simulator.object(object.id());

    if (serverObject?.online) {
      serverObject.visible_for_map(spot !== FALSE);

      if (mapSpot !== null) {
        const descriptor = mapNpcMarks[mapSpot];

        if (level.map_has_object_spot(objectId, descriptor.map_location) !== 0) {
          level.map_remove_object_spot(objectId, descriptor.map_location);
        }

        if (actor && object && object.general_goodwill(actor) > -1000) {
          level.map_add_object_spot(objectId, descriptor.map_location, descriptor.hint);
        }
      } else {
        Object.values(mapMarks).forEach((it) => {
          if (level.map_has_object_spot(objectId, it) !== 0) {
            level.map_remove_object_spot(objectId, it);
          }
        });
      }
    }
  }

  /**
   * todo: Description.
   */
  public removeObjectMapSpot(object: ClientObject, state: IRegistryObjectState): void {
    logger.info("Remove object spot:", object.name());

    const simulator: AlifeSimulator = alife();

    if (!simulator) {
      return;
    }

    const objectId: Maybe<TNumberId> = simulator.object(object.id())?.id;
    let mapSpot: Optional<EMapMarkType> = readIniString<EMapMarkType>(
      state.ini,
      state.sectionLogic,
      "level_spot",
      false,
      ""
    ) as EMapMarkType;

    // todo: Retry, probably not needed at all.
    if (mapSpot === null) {
      mapSpot = readIniString<EMapMarkType>(state.ini, state.activeSection, "level_spot", false, "") as EMapMarkType;
    }

    if (mapSpot !== null) {
      const actor: ClientObject = registry.actor;
      const mapSpotConditionsList: TConditionList = parseConditionsList(mapSpot);

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
   * todo: Description.
   */
  public updatePrimaryObjectsDisplay(): void {
    primaryMapSpotObjects.forEach((it) => {
      const objectId: Optional<TNumberId> = getObjectIdByStoryId(it.target);

      if (objectId) {
        level.map_add_object_spot(objectId, "primary_object", it.hint);
      }
    });

    this.updateAnomalyZonesDisplay();
    this.updateSleepZonesDisplay();
  }

  /**
   * todo: Description.
   */
  public updateSleepZonesDisplay(): void {
    for (const [index, sleepZone] of sleepZones) {
      const objectId: Optional<TNumberId> = getObjectIdByStoryId(sleepZone.target);
      const storedObject: Optional<IRegistryObjectState> = objectId ? registry.objects.get(objectId) : null;

      if (objectId && storedObject && storedObject.object) {
        const actorPosition: Vector = registry.actor.position();
        const distanceFromActor: TDistance = storedObject.object.position().distance_to(actorPosition);
        const hasSleepSpot: boolean = level.map_has_object_spot(objectId, mapMarks.ui_pda2_actor_sleep_location) !== 0;

        if (distanceFromActor <= MapDisplayManager.DISTANCE_TO_SHOW_MAP_MARKS && !hasSleepSpot) {
          level.map_add_object_spot(objectId, mapMarks.ui_pda2_actor_sleep_location, sleepZone.hint);
        } else if (distanceFromActor > MapDisplayManager.DISTANCE_TO_SHOW_MAP_MARKS && hasSleepSpot) {
          level.map_remove_object_spot(objectId, mapMarks.ui_pda2_actor_sleep_location);
        }
      }
    }
  }

  /**
   * todo: Description.
   */
  public updateAnomalyZonesDisplay(): void {
    if (hasAlifeInfo(infoPortions.jup_b32_scanner_reward)) {
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
          const objectId: Optional<number> = getObjectIdByStoryId(scanner.target);

          let hint: TLabel = game.translate_string(scanner.hint) + "\\n" + " \\n";
          const artefactTable: LuaArray<TSection> = getAnomalyArtefacts(scanner.zone);

          if (artefactTable.length() > 0) {
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

  /**
   * todo: Description.
   */
  public override update(): void {
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
}
