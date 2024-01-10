import { game, level, patrol, time_global } from "xray16";

import { getManager, getStoryIdByObjectId, registry } from "@/engine/core/database";
import { AbstractManager } from "@/engine/core/managers/abstract";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { mapDisplayConfig } from "@/engine/core/managers/map/MapDisplayConfig";
import { ENotificationDirection, NotificationManager } from "@/engine/core/managers/notifications";
import { TSimulationObject } from "@/engine/core/managers/simulation";
import { SimulationManager } from "@/engine/core/managers/simulation/SimulationManager";
import { surgeConfig } from "@/engine/core/managers/surge/SurgeConfig";
import { ITravelRouteDescriptor } from "@/engine/core/managers/travel/travel_types";
import { travelConfig } from "@/engine/core/managers/travel/TravelConfig";
import { SmartTerrain } from "@/engine/core/objects/smart_terrain/SmartTerrain";
import type { Squad } from "@/engine/core/objects/squad/Squad";
import { ESquadActionType } from "@/engine/core/objects/squad/squad_types";
import { setSquadPosition } from "@/engine/core/objects/squad/utils";
import { abort } from "@/engine/core/utils/assertion";
import { isSmartTerrain, isSquad } from "@/engine/core/utils/class_ids";
import { getObjectCommunity } from "@/engine/core/utils/community";
import { createGameAutoSave } from "@/engine/core/utils/game_save";
import { hasInfoPortion } from "@/engine/core/utils/info_portion";
import { pickSectionFromCondList } from "@/engine/core/utils/ini";
import { ELuaLoggerMode, LuaLogger } from "@/engine/core/utils/logging";
import { getObjectSmartTerrain, getServerDistanceBetween } from "@/engine/core/utils/position";
import { isAnySquadMemberEnemyToActor } from "@/engine/core/utils/relation";
import { getObjectSquad } from "@/engine/core/utils/squad";
import { vectorToString } from "@/engine/core/utils/vector";
import { postProcessors } from "@/engine/lib/constants/animation";
import { communities, TCommunity } from "@/engine/lib/constants/communities";
import { ACTOR_ID } from "@/engine/lib/constants/ids";
import { TRUE } from "@/engine/lib/constants/words";
import {
  GameObject,
  Optional,
  Patrol,
  Phrase,
  PhraseDialog,
  PhraseScript,
  ServerObject,
  TClassId,
  TCount,
  TDirection,
  TDistance,
  TDuration,
  TLabel,
  TName,
  TNumberId,
  TStringId,
  TTimestamp,
  Vector,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename, { file: "travel", mode: ELuaLoggerMode.DUAL });

/**
 * Manager to handle fast traveling of actor.
 *
 * todo: Fix faction-specific labels and answers. Originally commented and hardcoded to stalkers?
 * todo: Move some pure methods to utils.
 */
export class TravelManager extends AbstractManager {
  public isTraveling: boolean = false;
  public isTravelTeleported: boolean = false;
  public travelingStartedAt: TTimestamp = 0;

  private travelToSmartId: Optional<TNumberId> = null;
  private travelDistance: Optional<TDuration> = null;
  private travelActorPath: Optional<TName> = null;
  private travelSquadPath: Optional<TName> = null;
  private travelSquad: Optional<Squad> = null;

  public override initialize(): void {
    const eventsManager: EventsManager = getManager(EventsManager);

    eventsManager.registerCallback(EGameEvent.ACTOR_UPDATE, this.update, this);
  }

  public override destroy(): void {
    const eventsManager: EventsManager = getManager(EventsManager);

    eventsManager.unregisterCallback(EGameEvent.ACTOR_UPDATE, this.update);
  }

  /**
   * Create fast traveling phrases for provided dialog.
   *
   * @param dialog - target dialog to modify
   */
  public initializeTravellerDialog(dialog: PhraseDialog): void {
    const community: TCommunity = communities.stalker; // -- object:character_community()

    let actorPhrase: Phrase;
    let actorScript: PhraseScript;

    dialog.AddPhrase("dm_traveler_what_are_you_doing", "0", "", -10000);

    let npcPhrase: Phrase = dialog.AddPhrase("if you see this - this is bad", "1", "0", -10000);
    let npcPhraseScript: PhraseScript = npcPhrase.GetPhraseScript();

    npcPhraseScript.SetScriptText("travel_callbacks.get_squad_current_action_description");

    actorPhrase = dialog.AddPhrase("dm_traveler_can_i_go_with_you", "11", "1", -10000);
    actorScript = actorPhrase.GetPhraseScript();
    actorScript.AddPrecondition("travel_callbacks.can_actor_move_with_squad");

    npcPhrase = dialog.AddPhrase("dm_traveler_" + community + "_actor_companion_yes", "111", "11", -10000);
    npcPhraseScript = npcPhrase.GetPhraseScript();
    npcPhraseScript.AddPrecondition("travel_callbacks.can_squad_take_actor");

    actorPhrase = dialog.AddPhrase("dm_traveler_actor_go_with_squad", "1111", "111", -10000);
    actorScript = actorPhrase.GetPhraseScript();
    actorScript.AddAction("travel_callbacks.on_travel_together_with_squad");

    dialog.AddPhrase("dm_traveler_actor_dont_go_with_squad", "1112", "111", -10000);

    npcPhrase = dialog.AddPhrase("dm_traveler_" + community + "_actor_companion_no", "112", "11", -10000);
    npcPhraseScript = npcPhrase.GetPhraseScript();
    npcPhraseScript.AddPrecondition("travel_callbacks.cannot_squad_take_actor");

    actorPhrase = dialog.AddPhrase("dm_traveler_take_me_to", "12", "1", -10000);

    npcPhrase = dialog.AddPhrase("dm_traveler_" + community + "_where_do_you_want", "121", "12", -10000);
    npcPhraseScript = npcPhrase.GetPhraseScript();
    npcPhraseScript.AddPrecondition("travel_callbacks.can_squad_travel");

    for (const [, descriptor] of travelConfig.TRAVEL_DESCRIPTORS_BY_NAME) {
      actorPhrase = dialog.AddPhrase(game.translate_string(descriptor.name) + ".", descriptor.phraseId, "121", -10000);
      actorScript = actorPhrase.GetPhraseScript();
      actorScript.AddPrecondition("travel_callbacks.can_negotiate_travel_to_smart");

      npcPhrase = dialog.AddPhrase(
        "if you see this - this is bad",
        descriptor.phraseId + "_1",
        descriptor.phraseId,
        -10000
      );
      npcPhraseScript = npcPhrase.GetPhraseScript();
      npcPhraseScript.SetScriptText("travel_callbacks.get_travel_cost");

      actorPhrase = dialog.AddPhrase(
        "dm_traveler_actor_agree",
        descriptor.phraseId + "_11",
        descriptor.phraseId + "_1",
        -10000
      );
      actorScript = actorPhrase.GetPhraseScript();
      actorScript.AddAction("travel_callbacks.on_travel_to_specific_smart_with_squad");
      actorScript.AddPrecondition("travel_callbacks.is_enough_money_to_travel");

      actorPhrase = dialog.AddPhrase(
        "dm_traveler_actor_has_no_money",
        descriptor.phraseId + "_13",
        descriptor.phraseId + "_1",
        -10000
      );
      actorScript = actorPhrase.GetPhraseScript();
      actorScript.AddPrecondition("travel_callbacks.is_not_enough_money_to_travel");

      actorPhrase = dialog.AddPhrase(
        "dm_traveler_actor_refuse",
        descriptor.phraseId + "_14",
        descriptor.phraseId + "_1",
        -10000
      );
    }

    dialog.AddPhrase("dm_traveler_actor_refuse", "1211", "121", -10000);

    npcPhrase = dialog.AddPhrase("dm_traveler_" + community + "_i_cant_travel", "122", "12", -10000);
    npcPhraseScript = npcPhrase.GetPhraseScript();
    npcPhraseScript.AddPrecondition("travel_callbacks.cannot_squad_travel");

    dialog.AddPhrase("dm_traveler_bye", "13", "1", -10000);
  }

  /**
   * @param actor - actor game object
   * @param object - target object to check whether actor can travel
   * @returns whether object actor can discuss traveling with object
   */
  public canStartTravelingDialogs(actor: GameObject, object: GameObject): boolean {
    const squad: Optional<Squad> = getObjectSquad(object);
    const objectCommunity: TCommunity = object.character_community();

    if (squad !== null && squad.commander_id() !== object.id()) {
      return false;
    } else if (objectCommunity === communities.bandit || objectCommunity === communities.army) {
      return false;
    } else if (getObjectSmartTerrain(object)?.name() === "jup_b41") {
      return false;
    }

    return true;
  }

  /**
   * todo: Description.
   */
  public getSquadCurrentActionDescription(
    actor: GameObject,
    object: GameObject,
    dialogId?: TStringId,
    phraseId?: TStringId
  ): TLabel {
    const squad: Squad = getObjectSquad(object)!;
    const squadTargetId: Optional<TNumberId> = squad.assignedTargetId;

    if (squad.currentAction === null || squad.currentAction.type === ESquadActionType.STAY_ON_TARGET) {
      return "dm_stalker_doing_nothing_" + tostring(math.random(1, 3)); // -- object:character_community()
    }

    const targetSquadObject: Optional<TSimulationObject> = registry.simulator.object(squadTargetId!);

    if (targetSquadObject === null) {
      abort("Simulation target not existing '%s', action_name '%s'.", squadTargetId, squad.currentAction.type);
    }

    const targetClsId: TClassId = targetSquadObject.clsid();

    if (isSmartTerrain(targetSquadObject)) {
      const smartDescription: TLabel = travelConfig.TRAVEL_LOCATIONS.get(targetSquadObject.name());

      if (smartDescription === null) {
        abort("wrong smart name '%s' in travel_manager.ltx", targetSquadObject.name());
      }

      return smartDescription;
    } else if (isSquad(targetSquadObject)) {
      return string.format(
        "dm_%s_chasing_squad_%s",
        communities.stalker,
        getObjectCommunity(targetSquadObject as Squad)
      );
    } else {
      if (targetSquadObject.id === ACTOR_ID) {
        abort("Actor talking with squad, which chasing actor.");
      } else {
        abort("Wrong target clsid [%s] supplied for travel manager.", tostring(targetClsId));
      }
    }
  }

  /**
   * todo: Description.
   */
  public canActorMoveWithSquad(
    actor: GameObject,
    object: GameObject,
    dialogId?: TStringId,
    phraseId?: TStringId
  ): boolean {
    return getObjectSquad(object)!.currentAction?.type === ESquadActionType.REACH_TARGET;
  }

  /**
   * todo: Description.
   */
  public canSquadTakeActor(object: GameObject, actor: GameObject, dialogId?: TStringId, phraseId?: TStringId): boolean {
    const squad: Squad = getObjectSquad(object) as Squad;

    return isSmartTerrain(registry.simulator.object(squad.assignedTargetId!) as ServerObject);
  }

  /**
   * todo: Description.
   */
  public isSmartAvailableToReach(smartName: TName, descriptor: ITravelRouteDescriptor, squad: Squad): boolean {
    if (descriptor.level !== level.name()) {
      return false;
    }

    if (mapDisplayConfig.REQUIRE_SMART_TERRAIN_VISIT && !hasInfoPortion(string.format("%s_visited", smartName))) {
      return false;
    }

    const smartTerrain: Optional<SmartTerrain> = getManager(SimulationManager).getSmartTerrainByName(smartName);

    if (smartTerrain === null) {
      abort("Error in travel manager. Smart terrain '%s' does not exist.", smartName);
    }

    return (
      pickSectionFromCondList(registry.actor, smartTerrain, descriptor.condlist) === TRUE &&
      getServerDistanceBetween(squad, smartTerrain) > travelConfig.TRAVEL_DISTANCE_MIN_THRESHOLD
    );
  }

  /**
   * todo: Description.
   */
  public canSquadTravel(object: GameObject, actor: GameObject, dialogId: TStringId, phraseId: TStringId): boolean {
    const squad: Squad = getObjectSquad(object)!;

    // todo: Filter all squads to current level, do not check other locations.
    for (const [id, descriptor] of travelConfig.TRAVEL_DESCRIPTORS_BY_NAME) {
      if (this.isSmartAvailableToReach(id, descriptor, squad)) {
        return true;
      }
    }

    return false;
  }

  /**
   * todo: Description.
   */
  public canNegotiateTravelToSmart(
    actor: GameObject,
    object: GameObject,
    dialogId: TStringId,
    prevPhraseId: TStringId,
    phraseId: TStringId
  ): boolean {
    const smartName: Optional<TName> = travelConfig.TRAVEL_DESCRIPTORS_BY_PHRASE.get(phraseId);

    if (smartName === null) {
      abort("Error in travel manager, not available smart name: '%s'.", tostring(phraseId));
    }

    return this.isSmartAvailableToReach(
      smartName,
      travelConfig.TRAVEL_DESCRIPTORS_BY_NAME.get(smartName),
      getObjectSquad(object)!
    );
  }

  /**
   * todo: Move to utils.
   *
   * @param distance - traveling distance from current point to destination
   * @returns travel price based on travel distance
   */
  public getTravelPriceByDistance(distance: TDistance): TCount {
    return math.ceil(distance / 50) * 50;
  }

  /**
   * todo: Description.
   */
  public getTravelPriceByObjectPhrase(object: GameObject, phraseId: TStringId): TCount {
    const simulationBoardManager: SimulationManager = getManager(SimulationManager);
    const smartTerrainName: TName = travelConfig.TRAVEL_DESCRIPTORS_BY_PHRASE.get(
      string.sub(phraseId, 1, string.len(phraseId) - 2)
    );

    return this.getTravelPriceByDistance(
      object.position().distance_to(simulationBoardManager.getSmartTerrainByName(smartTerrainName)!.position)
    );
  }

  /**
   * todo: Description.
   */
  public getTravelCostLabel(actor: GameObject, object: GameObject, dialogId: TStringId, phraseId: TStringId): TLabel {
    return string.format(
      "%s %s.",
      game.translate_string("dm_traveler_travel_cost"),
      this.getTravelPriceByObjectPhrase(object, phraseId)
    );
  }

  /**
   * todo: Description.
   */
  public isEnoughMoneyToTravel(
    actor: GameObject,
    object: GameObject,
    dialogId: TStringId,
    phraseId: TStringId
  ): boolean {
    return this.getTravelPriceByObjectPhrase(object, phraseId) <= registry.actor.money();
  }

  /**
   * Tick of active actor update when teleporting from one place to another.
   * todo;
   * todo: Probably add some 'isTraveling' checker with assertion of types.
   */
  public override update(): void {
    if (!this.isTraveling) {
      return;
    }

    // Wait till prepare.
    if (time_global() - this.travelingStartedAt < travelConfig.TRAVEL_TELEPORT_DELAY) {
      return;
    }

    if (!this.isTravelTeleported) {
      logger.format("Teleporting actor on travel: %s %s", this.travelSquadPath, this.travelActorPath);

      this.isTravelTeleported = true;

      const point: Patrol = new patrol(this.travelActorPath!);
      const direction: TDirection = -point.point(1).sub(point.point(0)).getH();
      const board: SimulationManager = getManager(SimulationManager);

      // todo: Why releasing enemies? Probably not needed.
      for (const [, squad] of board.getSmartTerrainDescriptor(this.travelToSmartId!)!.assignedSquads) {
        if (getStoryIdByObjectId(squad.id) === null && isAnySquadMemberEnemyToActor(squad)) {
          board.releaseSquad(squad);
        }
      }

      const currentSmartId: Optional<TNumberId> = this.travelSquad!.assignedSmartTerrainId;

      if (currentSmartId !== null) {
        logger.format("Leave smart on traveling: '%s' from '%s'", this.travelSquad!.name(), currentSmartId);

        board.assignSquadToSmartTerrain(this.travelSquad!, null);
        board.assignSquadToSmartTerrain(this.travelSquad!, currentSmartId);
      }

      const position: Vector = new patrol(this.travelSquadPath!).point(0);

      logger.format("Set squad position: '%s' -> '%s'", this.travelSquad!.name(), vectorToString(position));

      setSquadPosition(this.travelSquad as Squad, position);

      registry.actor.set_actor_direction(direction);
      registry.actor.set_actor_position(point.point(0));

      const timeTookInMinutes: TDuration = this.travelDistance! / 10;
      const hours: TDuration = math.floor(timeTookInMinutes / 60);
      const minutes: TDuration = timeTookInMinutes - hours * 60;

      level.change_game_time(0, hours, minutes);

      surgeConfig.IS_TIME_FORWARDED = true;

      logger.format(
        "Forwarded time on travel: '%s', '%s', '%s:%s'",
        this.travelSquadPath,
        this.travelActorPath,
        hours,
        minutes
      );
    }

    // Wait till resolve.
    if (time_global() - this.travelingStartedAt < travelConfig.TRAVEL_RESOLVE_DELAY) {
      return;
    }

    logger.format("Finish traveling");

    this.isTraveling = false;

    this.travelingStartedAt = 0;
    this.travelActorPath = null;
    this.travelSquadPath = null;
    this.travelSquad = null;
    this.travelDistance = null;
    this.travelToSmartId = null;

    level.show_weapon(true);
    level.enable_input();
    level.show_indicators();
  }

  /**
   * Travel together with squad to selected squad, pay them and ask to take somewhere.
   * todo;
   */
  public onTravelToSpecificSmartWithSquad(
    actor: GameObject,
    object: GameObject,
    dialogId: TStringId,
    phraseId: TStringId
  ): void {
    const simulationBoardManager: SimulationManager = getManager(SimulationManager);
    const travelPhraseId: TStringId = string.sub(phraseId, 1, string.len(phraseId) - 3);
    const smartName: TName = travelConfig.TRAVEL_DESCRIPTORS_BY_PHRASE.get(travelPhraseId);
    const smartTerrain: Optional<SmartTerrain> = simulationBoardManager.getSmartTerrainByName(smartName)!;
    const squad: Squad = getObjectSquad(object) as Squad;

    logger.format("Actor travel with squad: '%s' -> '%s'", squad.name(), smartName);

    createGameAutoSave("st_save_uni_travel_generic");

    object.stop_talk();

    level.disable_input();
    level.hide_indicators_safe();
    level.add_pp_effector(postProcessors.fade_in_out, 613, false);

    // todo: Alife distance vs abs distance.
    const distance: TDistance = getServerDistanceBetween(squad!, smartTerrain);
    const price: TCount = this.getTravelPriceByDistance(distance);

    logger.format("Actor travel distance and price: '%s' -> '%s'", distance, price);

    actor.give_money(-price);
    getManager(NotificationManager).sendMoneyRelocatedNotification(ENotificationDirection.OUT, price);

    this.isTravelTeleported = false;
    this.isTraveling = true;

    this.travelActorPath = smartTerrain.travelerActorPointName;
    this.travelSquadPath = smartTerrain.travelerSquadPointName;
    this.travelToSmartId = smartTerrain.id;
    this.travelSquad = squad;
    this.travelDistance = distance;
    this.travelingStartedAt = time_global();
  }

  /**
   * Travel together with squad to their assigned goal, just follow them.
   * Used when actor agrees to travel somewhere where squad heads.
   * todo;
   */
  public onTravelTogetherWithSquad(
    actor: GameObject,
    object: GameObject,
    dialogId: TStringId,
    phraseId: TStringId
  ): void {
    createGameAutoSave("st_save_uni_travel_generic");

    const squad: Squad = getObjectSquad(object)!;
    const squadTargetId: Optional<TNumberId> = squad.assignedTargetId;
    const smartTerrain: SmartTerrain = registry.simulator.object<SmartTerrain>(squadTargetId!)!;

    object.stop_talk();

    level.disable_input();
    level.hide_indicators_safe();
    level.add_pp_effector(postProcessors.fade_in_out, 613, false);

    this.isTravelTeleported = false;
    this.isTraveling = true;

    this.travelDistance = getServerDistanceBetween(squad, smartTerrain);
    this.travelActorPath = smartTerrain.travelerActorPointName;
    this.travelSquadPath = smartTerrain.travelerSquadPointName;
    this.travelToSmartId = smartTerrain.id;
    this.travelSquad = squad;
    this.travelingStartedAt = time_global();
  }
}
