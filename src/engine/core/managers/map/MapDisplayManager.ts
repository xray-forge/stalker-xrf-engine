import { game, level, time_global } from "xray16";

import { getObjectIdByStoryId, IRegistryObjectState, registry } from "@/engine/core/database";
import { AbstractManager } from "@/engine/core/managers/base/AbstractManager";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import {
  anomalyScannerObjects,
  mapNpcMarks,
  primaryMapSpotObjects,
  sleepZones,
} from "@/engine/core/managers/map/map_display_marks";
import { ETreasureType, ITreasureDescriptor } from "@/engine/core/managers/treasures/treasures_types";
import type { SmartTerrain } from "@/engine/core/objects/server/smart_terrain";
import type { Squad } from "@/engine/core/objects/server/squad";
import { getAnomalyArtefacts } from "@/engine/core/utils/anomaly";
import { hasInfoPortion } from "@/engine/core/utils/info_portion";
import { parseConditionsList, pickSectionFromCondList, readIniString, TConditionList } from "@/engine/core/utils/ini";
import { LuaLogger } from "@/engine/core/utils/logging";
import {
  ERelation,
  getSquadMembersRelationToActor,
  getSquadMembersRelationToActorSafe,
} from "@/engine/core/utils/relation";
import { isSquadMonsterCommunity } from "@/engine/core/utils/section";
import { forgeConfig } from "@/engine/lib/configs/ForgeConfig";
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
  TName,
  TNumberId,
  TSection,
  TTimestamp,
  Vector,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Manager handling display of objects on game map in PDA.
 */
export class MapDisplayManager extends AbstractManager {
  public static readonly DISTANCE_TO_SHOW_MAP_MARKS: TDistance = 75;
  public static readonly UPDATES_THROTTLE: TDuration = 5_000;

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
   * Update map display for game object.
   *
   * @param object - target client object
   * @param scheme - active logic scheme
   * @param state - target object registry state
   * @param section - active logic section
   */
  public updateObjectMapSpot(
    object: ClientObject,
    scheme: EScheme,
    state: IRegistryObjectState,
    section: TSection
  ): void {
    // logger.info("Update object spot:", object.name());

    const objectId: TNumberId = object.id();
    const simulator: AlifeSimulator = registry.simulator;

    if (!simulator) {
      return;
    }

    let spotSection;

    if (scheme === null || scheme === NIL) {
      spotSection = readIniString(state.ini, state.sectionLogic, "show_spot", false);
    } else {
      spotSection = readIniString(state.ini, section, "show_spot", false);
    }

    if (spotSection === null) {
      spotSection = TRUE;
    }

    const actor: ClientObject = registry.actor;
    let mapSpot: Optional<EMapMarkType> = readIniString(
      state.ini,
      state.sectionLogic,
      "level_spot",
      false
    ) as EMapMarkType;

    if (mapSpot === null) {
      mapSpot = readIniString(state.ini!, section, "level_spot", false) as EMapMarkType;
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
   * Remove object map spot display.
   *
   * @param object - target client object
   * @param state - target object registry state
   */
  public removeObjectMapSpot(object: ClientObject, state: IRegistryObjectState): void {
    logger.info("Remove object spot:", object.name());

    const simulator: AlifeSimulator = registry.simulator;

    if (!simulator) {
      return;
    }

    const objectId: Maybe<TNumberId> = simulator.object(object.id())?.id;
    let mapSpot: Optional<EMapMarkType> = readIniString<EMapMarkType>(
      state.ini,
      state.sectionLogic,
      "level_spot",
      false
    ) as EMapMarkType;

    // todo: Retry, probably not needed at all.
    if (mapSpot === null) {
      mapSpot = readIniString<EMapMarkType>(state.ini, state.activeSection, "level_spot", false) as EMapMarkType;
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
   * Update map spot for squad.
   *
   * @param squad - target squad server object
   */
  public updateSquadMapSpot(squad: Squad): void {
    const squadCommanderId: TNumberId = squad.commander_id();

    if (squad.isMapDisplayHidden || squadCommanderId === null) {
      return this.removeSquadMapSpot(squad);
    }

    if (squad.currentMapSpotId !== squadCommanderId) {
      this.removeSquadMapSpot(squad);
      squad.currentMapSpotId = squadCommanderId;
      this.updateSquadMapSpot(squad);

      return;
    }

    // Squad leader is NPC with some role, do not display default icons.
    if (
      level.map_has_object_spot(squadCommanderId, mapMarks.ui_pda2_trader_location) !== 0 ||
      level.map_has_object_spot(squadCommanderId, mapMarks.ui_pda2_mechanic_location) !== 0 ||
      level.map_has_object_spot(squadCommanderId, mapMarks.ui_pda2_scout_location) !== 0 ||
      level.map_has_object_spot(squadCommanderId, mapMarks.ui_pda2_quest_npc_location) !== 0 ||
      level.map_has_object_spot(squadCommanderId, mapMarks.ui_pda2_medic_location) !== 0
    ) {
      squad.isMapDisplayHidden = true;

      return;
    }

    let spot: Optional<TLabel> = null;

    /**
     * In case of debug use map display like in clear sky.
     */
    if (forgeConfig.DEBUG.IS_SIMULATION_ENABLED) {
      if (isSquadMonsterCommunity(squad.faction)) {
        spot = mapMarks.alife_presentation_squad_monster_debug;
      } else {
        const relation: ERelation = getSquadMembersRelationToActorSafe(squad);

        switch (relation) {
          case ERelation.FRIEND:
            spot = mapMarks.alife_presentation_squad_friend_debug;
            break;
          case ERelation.NEUTRAL:
            spot = mapMarks.alife_presentation_squad_neutral_debug;
            break;
          case ERelation.ENEMY:
            spot = mapMarks.alife_presentation_squad_enemy_debug;
            break;
        }
      }
      /**
       * Display only minimap marks.
       * Do not display for offline objects.
       */
    } else if (!isSquadMonsterCommunity(squad.faction)) {
      const relation: Optional<ERelation> = getSquadMembersRelationToActor(squad);

      switch (relation) {
        case ERelation.FRIEND:
          spot = mapMarks.alife_presentation_squad_friend;
          break;

        case ERelation.NEUTRAL:
          spot = mapMarks.alife_presentation_squad_neutral;
          break;
      }
    }

    if (spot) {
      const hint: TLabel = squad.getMapDisplayHint();
      const hasMapSpot: boolean = level.map_has_object_spot(squad.currentMapSpotId, spot) === 1;

      if (spot === squad.currentMapSpotSection && hasMapSpot) {
        return level.map_change_spot_hint(squad.currentMapSpotId, spot, hint);
      }

      if (squad.currentMapSpotSection === null || !hasMapSpot) {
        level.map_add_object_spot(squad.currentMapSpotId, spot, hint);
      } else {
        level.map_remove_object_spot(squad.currentMapSpotId, squad.currentMapSpotSection);
        level.map_add_object_spot(squad.currentMapSpotId, spot, hint);
      }

      squad.currentMapSpotSection = spot;
    } else if (squad.currentMapSpotSection) {
      level.map_remove_object_spot(squad.currentMapSpotId, squad.currentMapSpotSection);
      squad.currentMapSpotSection = null;
    }
  }

  /**
   * Remove map spot for squad.
   *
   * @param squad - target squad server object
   */
  public removeSquadMapSpot(squad: Squad): void {
    if (squad.currentMapSpotId === null || squad.currentMapSpotSection === null) {
      return;
    } else {
      level.map_remove_object_spot(squad.currentMapSpotId, squad.currentMapSpotSection);

      squad.currentMapSpotId = null;
      squad.currentMapSpotSection = null;
    }
  }

  /**
   * todo: Description.
   */
  public updateSmartTerrainMapSpot(smartTerrain: SmartTerrain): void {
    /**
     * If debug enabled, render map spots.
     */
    if (forgeConfig.DEBUG.IS_SIMULATION_ENABLED) {
      let spot: ERelation = ERelation.NEUTRAL;

      if (
        smartTerrain.isSimulationAvailableConditionList === null ||
        pickSectionFromCondList(registry.actor, smartTerrain, smartTerrain.isSimulationAvailableConditionList) === TRUE
      ) {
        spot = ERelation.FRIEND;
      } else {
        spot = ERelation.ENEMY;
      }

      const previousSelector: TName = string.format(
        "alife_presentation_smart_%s_%s",
        smartTerrain.simulationRole,
        smartTerrain.smartTerrainDisplayedMapSpot
      );

      if (smartTerrain.smartTerrainDisplayedMapSpot === spot) {
        level.map_change_spot_hint(smartTerrain.id, previousSelector, smartTerrain.getMapDisplayHint());

        return;
      }

      // If previous mark is defined.
      if (smartTerrain.smartTerrainDisplayedMapSpot !== null) {
        level.map_remove_object_spot(smartTerrain.id, previousSelector);
      }

      // If next mark is defined.
      if (spot !== null) {
        const nextSelector: TName = string.format("alife_presentation_smart_%s_%s", smartTerrain.simulationRole, spot);

        level.map_add_object_spot(smartTerrain.id, nextSelector, smartTerrain.getMapDisplayHint());
      }

      smartTerrain.smartTerrainDisplayedMapSpot = spot;

      return;
    }

    /**
     * If not enabled rendering, just remove map spot if needed.
     */
    if (
      smartTerrain.smartTerrainDisplayedMapSpot !== null &&
      level.map_has_object_spot(
        smartTerrain.id,
        "alife_presentation_smart_" + smartTerrain.simulationRole + "_" + smartTerrain.smartTerrainDisplayedMapSpot
      )
    ) {
      level.map_remove_object_spot(
        smartTerrain.id,
        "alife_presentation_smart_" + smartTerrain.simulationRole + "_" + smartTerrain.smartTerrainDisplayedMapSpot
      );
      smartTerrain.smartTerrainDisplayedMapSpot = null;
    }
  }

  /**
   * Display map spot for treasure.
   *
   * @param id - treasure restrictor ID to display on game map
   * @param descriptor - treasure descriptor
   * @param hint - label to display on secret hovering
   */
  public showTreasureMapSpot(id: TNumberId, descriptor: ITreasureDescriptor, hint: TLabel = ""): void {
    level.map_add_object_spot_ser(id, this.getSpotForTreasure(descriptor), hint);
  }

  /**
   * Remove treasure spot for treasure descriptor.
   *
   * @param id - treasure restrictor ID to remove from game map
   * @param descriptor - treasure descriptor
   */
  public removeTreasureMapSpot(id: TNumberId, descriptor: ITreasureDescriptor): void {
    level.map_remove_object_spot(id, this.getSpotForTreasure(descriptor));
  }

  /**
   * @returns icon name for provided descriptor, based on treasure type
   */
  public getSpotForTreasure(descriptor: ITreasureDescriptor): TName {
    switch (descriptor.type) {
      case ETreasureType.RARE:
        return mapMarks.treasure_rare;

      case ETreasureType.EPIC:
        return mapMarks.treasure_epic;

      case ETreasureType.UNIQUE:
        return mapMarks.treasure_unique;

      case ETreasureType.COMMON:
      default:
        return mapMarks.treasure;
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
  public removeSmartTerrainMapSpot(smartTerrain: SmartTerrain): void {
    if (smartTerrain.smartTerrainDisplayedMapSpot === null) {
      return;
    }

    level.map_remove_object_spot(
      smartTerrain.id,
      "alife_presentation_smart_" + smartTerrain.simulationRole + "_" + smartTerrain.smartTerrainDisplayedMapSpot
    );
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
    if (hasInfoPortion(infoPortions.jup_b32_scanner_reward)) {
      for (const [index, scanner] of anomalyScannerObjects) {
        scanner.enabled = hasInfoPortion(scanner.group);
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
            hint = hint + game.translate_string("st_jup_b32_has_af");
            for (const [k, v] of artefactTable!) {
              hint = hint + "\\n" + game.translate_string("st_" + v + "_name");
            }
          } else {
            hint = hint + game.translate_string("st_jup_b32_no_af");
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
   * Handle update tick for map display.
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
