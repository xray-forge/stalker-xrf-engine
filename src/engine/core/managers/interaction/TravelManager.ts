import { alife, clsid, game, level, patrol, time_global } from "xray16";

import { getStoryIdByObjectId, registry, TRAVEL_MANAGER_LTX } from "@/engine/core/database";
import { AbstractCoreManager } from "@/engine/core/managers/base/AbstractCoreManager";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { ENotificationDirection } from "@/engine/core/managers/interface/notifications";
import { NotificationManager } from "@/engine/core/managers/interface/notifications/NotificationManager";
import { TSimulationObject } from "@/engine/core/managers/simulation";
import { SimulationBoardManager } from "@/engine/core/managers/simulation/SimulationBoardManager";
import { SurgeManager } from "@/engine/core/managers/world/SurgeManager";
import { SmartTerrain } from "@/engine/core/objects/server/smart_terrain/SmartTerrain";
import { SquadStayOnTargetAction } from "@/engine/core/objects/server/squad/action";
import { Squad } from "@/engine/core/objects/server/squad/Squad";
import { abort } from "@/engine/core/utils/assertion";
import { createGameAutoSave } from "@/engine/core/utils/game/game_save";
import { parseConditionsList, pickSectionFromCondList, TConditionList } from "@/engine/core/utils/ini";
import { LuaLogger } from "@/engine/core/utils/logging";
import {
  getObjectCommunity,
  getObjectSmartTerrain,
  getObjectSquad,
  getServerDistanceBetween,
} from "@/engine/core/utils/object";
import { isAnySquadMemberEnemyToActor } from "@/engine/core/utils/relation";
import { postProcessors } from "@/engine/lib/constants/animation/post_processors";
import { captions } from "@/engine/lib/constants/captions/captions";
import { communities, TCommunity } from "@/engine/lib/constants/communities";
import { TRUE } from "@/engine/lib/constants/words";
import { zones } from "@/engine/lib/constants/zones";
import {
  ClientObject,
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
  TSection,
  TStringId,
  TTimestamp,
  Vector,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export interface ITravelRouteDescriptor {
  phrase_id: string;
  name: string;
  level: string;
  condlist: TConditionList;
}

/**
 * Manager to handle fast traveling of actor.
 */
export class TravelManager extends AbstractCoreManager {
  public static readonly LOCATIONS_LTX_SECTION: TSection = "locations";
  public static readonly TRAVELER_LTX_SECTION: TSection = "traveler";
  public static readonly NAME_LTX_SECTION: TSection = "name";
  public static readonly LEVEL_LTX_SECTION: TSection = "level";

  /**
   * Distance considered too close to travel with group of stalkers.
   */
  public static readonly SMART_TRAVEL_DISTANCE_MIN_THRESHOLD: TDistance = 50;

  /**
   * Duration to delay UI visibility after fast travel.
   */
  public static readonly SMART_TRAVEL_TELEPORT_DELAY: TDuration = 3_000;
  public static readonly SMART_TRAVEL_RESOLVE_DELAY: TDuration = 6_000;

  public readonly smartDescriptionsByName: LuaTable<TName, TLabel> = new LuaTable();
  public readonly smartTravelDescriptorsByName: LuaTable<TName, ITravelRouteDescriptor> = new LuaTable();
  public readonly smartNamesByPhraseId: LuaTable<TName, TStringId> = new LuaTable();

  private travelingStartedAt: Optional<TTimestamp> = null;
  private isTravelTeleported: boolean = false;
  public isTraveling: boolean = false;

  private travelToSmartId: Optional<TNumberId> = null;
  private travelDistance: Optional<TDuration> = null;
  private travelActorPath: Optional<string> = null;
  private travelSquadPath: Optional<string> = null;
  private travelSquad: Optional<Squad> = null;

  public override initialize(): void {
    const eventsManager: EventsManager = EventsManager.getInstance();

    eventsManager.registerCallback(EGameEvent.ACTOR_UPDATE, this.update, this);

    for (const it of $range(0, TRAVEL_MANAGER_LTX.line_count(TravelManager.LOCATIONS_LTX_SECTION) - 1)) {
      const [temp1, id, value] = TRAVEL_MANAGER_LTX.r_line(TravelManager.LOCATIONS_LTX_SECTION, it, "", "");

      this.smartDescriptionsByName.set(id, value);
    }

    for (const it of $range(0, TRAVEL_MANAGER_LTX.line_count(TravelManager.TRAVELER_LTX_SECTION) - 1)) {
      const [temp1, name, value] = TRAVEL_MANAGER_LTX.r_line(TravelManager.TRAVELER_LTX_SECTION, it, "", "");
      const phraseId: TStringId = tostring(1000 + it);

      this.smartNamesByPhraseId.set(phraseId, name);
      this.smartTravelDescriptorsByName.set(name, {
        name: TRAVEL_MANAGER_LTX.r_string(name, TravelManager.NAME_LTX_SECTION),
        level: TRAVEL_MANAGER_LTX.r_string(name, TravelManager.LEVEL_LTX_SECTION),
        condlist: parseConditionsList(TRAVEL_MANAGER_LTX.r_string(name, "condlist")),
        phrase_id: phraseId,
      });
    }
  }

  public override destroy(): void {
    const eventsManager: EventsManager = EventsManager.getInstance();

    eventsManager.unregisterCallback(EGameEvent.ACTOR_UPDATE, this.update);
  }

  /**
   * todo: Description.
   */
  public initializeTravellerDialog(dialog: PhraseDialog): void {
    const npcCommunity: TCommunity = communities.stalker; // -- npc:character_community()

    let actorPhrase: Phrase = dialog.AddPhrase(captions.dm_traveler_what_are_you_doing, "0", "", -10000);
    let actorScript: PhraseScript = actorPhrase.GetPhraseScript();

    let npcPhrase: Phrase = dialog.AddPhrase("if you see this - this is bad", "1", "0", -10000);
    let npcPhraseScript: PhraseScript = npcPhrase.GetPhraseScript();

    npcPhraseScript.SetScriptText("travel_callbacks.getSquadCurrentActionDescription");

    actorPhrase = dialog.AddPhrase("dm_traveler_can_i_go_with_you", "11", "1", -10000);
    actorScript = actorPhrase.GetPhraseScript();
    actorScript.AddPrecondition("travel_callbacks.canActorMoveWithSquad");

    npcPhrase = dialog.AddPhrase("dm_traveler_" + npcCommunity + "_actor_companion_yes", "111", "11", -10000);
    npcPhraseScript = npcPhrase.GetPhraseScript();
    npcPhraseScript.AddPrecondition("travel_callbacks.canSquadTakeActor");

    actorPhrase = dialog.AddPhrase("dm_traveler_actor_go_with_squad", "1111", "111", -10000);
    actorScript = actorPhrase.GetPhraseScript();
    actorScript.AddAction("travel_callbacks.onTravelTogetherWithSquad");

    actorPhrase = dialog.AddPhrase("dm_traveler_actor_dont_go_with_squad", "1112", "111", -10000);

    npcPhrase = dialog.AddPhrase("dm_traveler_" + npcCommunity + "_actor_companion_no", "112", "11", -10000);
    npcPhraseScript = npcPhrase.GetPhraseScript();
    npcPhraseScript.AddPrecondition("travel_callbacks.cannotSquadTakeActor");

    actorPhrase = dialog.AddPhrase("dm_traveler_take_me_to", "12", "1", -10000);

    npcPhrase = dialog.AddPhrase("dm_traveler_" + npcCommunity + "_where_do_you_want", "121", "12", -10000);
    npcPhraseScript = npcPhrase.GetPhraseScript();
    npcPhraseScript.AddPrecondition("travel_callbacks.canSquadTravel");

    for (const [k, v] of this.smartTravelDescriptorsByName) {
      actorPhrase = dialog.AddPhrase(game.translate_string(v.name) + ".", v.phrase_id, "121", -10000);
      actorScript = actorPhrase.GetPhraseScript();
      actorScript.AddPrecondition("travel_callbacks.canNegotiateTravelToSmart");

      npcPhrase = dialog.AddPhrase("if you see this - this is bad", v.phrase_id + "_1", v.phrase_id, -10000);
      npcPhraseScript = npcPhrase.GetPhraseScript();
      npcPhraseScript.SetScriptText("travel_callbacks.getTravelConst");

      actorPhrase = dialog.AddPhrase("dm_traveler_actor_agree", v.phrase_id + "_11", v.phrase_id + "_1", -10000);
      actorScript = actorPhrase.GetPhraseScript();
      actorScript.AddAction("travel_callbacks.onTravelToSpecificSmartWithSquad");
      actorScript.AddPrecondition("travel_callbacks.isEnoughMoneyToTravel");

      actorPhrase = dialog.AddPhrase("dm_traveler_actor_has_no_money", v.phrase_id + "_13", v.phrase_id + "_1", -10000);
      actorScript = actorPhrase.GetPhraseScript();
      actorScript.AddPrecondition("travel_callbacks.isNotEnoughMoneyToTravel");

      actorPhrase = dialog.AddPhrase("dm_traveler_actor_refuse", v.phrase_id + "_14", v.phrase_id + "_1", -10000);
    }

    dialog.AddPhrase("dm_traveler_actor_refuse", "1211", "121", -10000);

    npcPhrase = dialog.AddPhrase("dm_traveler_" + npcCommunity + "_i_cant_travel", "122", "12", -10000);
    npcPhraseScript = npcPhrase.GetPhraseScript();
    npcPhraseScript.AddPrecondition("travel_callbacks.cannotSquadTravel");

    dialog.AddPhrase("dm_traveler_bye", "13", "1", -10000);
  }

  /**
   * todo: Description.
   */
  public canStartTravelingDialogs(actor: ClientObject, npc: ClientObject): boolean {
    const squad: Optional<Squad> = getObjectSquad(npc);

    if (squad !== null && squad.commander_id() !== npc.id()) {
      return false;
    } else if (npc.character_community() === communities.bandit) {
      return false;
    } else if (npc.character_community() === communities.army) {
      return false;
    } else if (getObjectSmartTerrain(npc)?.name() === zones.jup_b41) {
      return false;
    }

    return true;
  }

  /**
   * todo: Description.
   */
  public getSquadCurrentActionDescription(
    actor: ClientObject,
    npc: ClientObject,
    dialogId?: TStringId,
    phraseId?: TStringId
  ): TLabel {
    const squad: Squad = getObjectSquad(npc)!;
    const squadTargetId: Optional<TNumberId> = squad.assignedTargetId;

    if (squad.currentAction === null || squad.currentAction.name === SquadStayOnTargetAction.ACTION_NAME) {
      return "dm_" + "stalker" + "_doing_nothing_" + tostring(math.random(1, 3)); // -- npc:character_community()
    }

    const targetSquadObject: Optional<TSimulationObject> = alife().object(squadTargetId!);

    if (targetSquadObject === null) {
      abort("SIM TARGET NOT EXIST %s, action_name %s", tostring(squadTargetId), tostring(squad.currentAction.name));
    }

    const targetClsId: TClassId = targetSquadObject.clsid();

    if (targetClsId === clsid.script_actor) {
      abort("Actor talking with squad, which chasing actor.");
    } else if (targetClsId === clsid.online_offline_group_s) {
      return "dm_" + communities.stalker + "_chasing_squad_" + getObjectCommunity(targetSquadObject as Squad);
    } else if (targetClsId === clsid.smart_terrain) {
      const smartName: TName = targetSquadObject.name();
      const smartDescription: TLabel = this.smartDescriptionsByName.get(smartName);

      if (smartDescription === null) {
        abort("wrong smart name [%s] in travel_manager.ltx", tostring(smartName));
      }

      return smartDescription;
    } else {
      abort("Wrong target clsid [%s] supplied for travel manager.", tostring(targetClsId));
    }
  }

  /**
   * todo: Description.
   */
  public canActorMoveWithSquad(
    actor: ClientObject,
    npc: ClientObject,
    dialogId?: TStringId,
    phraseId?: TStringId
  ): boolean {
    const squad: Squad = getObjectSquad(npc)!;

    return !(squad.currentAction === null || squad.currentAction.name === SquadStayOnTargetAction.ACTION_NAME);
  }

  /**
   * todo: Description.
   */
  public canSquadTakeActor(
    npc: ClientObject,
    actor: ClientObject,
    dialogId?: TStringId,
    phraseId?: TStringId
  ): boolean {
    const squad: Squad = getObjectSquad(npc)!;
    const squadTargetObject: ServerObject = alife().object(squad.assignedTargetId!)!;
    const squadTargetClsId: TClassId = squadTargetObject.clsid();

    return squadTargetClsId === clsid.smart_terrain;
  }

  /**
   * todo: Description.
   */
  public cannotSquadTakeActor(
    npc: ClientObject,
    actor: ClientObject,
    dialog_id: TStringId,
    phrase_id: TStringId
  ): boolean {
    return !this.canSquadTakeActor(npc, actor, dialog_id, phrase_id);
  }

  /**
   * todo: Description.
   */
  public isSmartAvailableToReach(smartName: TName, smartTable: ITravelRouteDescriptor, squad: Squad): boolean {
    if (smartTable.level !== level.name()) {
      return false;
    }

    const simulationBoardManager: SimulationBoardManager = SimulationBoardManager.getInstance();
    const smartTerrain: Optional<SmartTerrain> = simulationBoardManager.getSmartTerrainByName(smartName);

    if (smartTerrain === null) {
      abort("Error in travel manager. Smart [%s] doesnt exist.", tostring(smartName));
    }

    if (pickSectionFromCondList(registry.actor, smartTerrain, smartTable.condlist) !== TRUE) {
      return false;
    }

    if (getServerDistanceBetween(squad, smartTerrain) < TravelManager.SMART_TRAVEL_DISTANCE_MIN_THRESHOLD) {
      return false;
    }

    return true;
  }

  /**
   * todo: Description.
   */
  public canSquadTravel(npc: ClientObject, actor: ClientObject, dialogId: TStringId, phraseId: TStringId): boolean {
    const squad: Squad = getObjectSquad(npc)!;

    // todo: Filter all squads to current level, do not check other locations.
    for (const [id, smartDescriptor] of this.smartTravelDescriptorsByName) {
      if (this.isSmartAvailableToReach(id, smartDescriptor, squad)) {
        return true;
      }
    }

    return false;
  }

  /**
   * todo: Description.
   */
  public cannotSquadTravel(npc: ClientObject, actor: ClientObject, dialogId: TStringId, phraseId: TStringId) {
    return !this.canSquadTravel(npc, actor, dialogId, phraseId);
  }

  /**
   * todo: Description.
   */
  public canNegotiateTravelToSmart(
    actor: ClientObject,
    npc: ClientObject,
    dialogId: TStringId,
    prevPhraseId: TStringId,
    phraseId: TStringId
  ): boolean {
    const smartName: TName = this.smartNamesByPhraseId.get(phraseId);

    if (smartName === null) {
      abort("Error in travel manager, no available smart name: '%s'.", tostring(phraseId));
    }

    return this.isSmartAvailableToReach(
      smartName,
      this.smartTravelDescriptorsByName.get(smartName),
      getObjectSquad(npc)!
    );
  }

  /**
   * todo: Description.
   */
  public getTravelPriceByDistance(distance: TDistance): TCount {
    return math.ceil(distance / 50) * 50;
  }

  /**
   * todo: Description.
   */
  public getTravelConst(actor: ClientObject, npc: ClientObject, dialogId: TStringId, phraseId: TStringId): TLabel {
    const simBoard: SimulationBoardManager = SimulationBoardManager.getInstance();
    const travelPhraseId: TStringId = string.sub(phraseId, 1, string.len(phraseId) - 2);
    const smartName: TName = this.smartNamesByPhraseId.get(travelPhraseId);
    const smartTerrain: Optional<SmartTerrain> = simBoard.getSmartTerrainByName(smartName)!;

    const distance: TDistance = npc.position().distance_to(smartTerrain.position);
    const price: TCount = this.getTravelPriceByDistance(distance);

    return game.translate_string(captions.dm_traveler_travel_cost) + " " + tostring(price) + ".";
  }

  /**
   * todo: Description.
   */
  public isEnoughMoneyToTravel(
    actor: ClientObject,
    npc: ClientObject,
    dialogId: TStringId,
    phraseId: TStringId
  ): boolean {
    const travelPhraseId: TStringId = string.sub(phraseId, 1, string.len(phraseId) - 2);
    const smartName: TName = this.smartNamesByPhraseId.get(travelPhraseId);
    const smart: Optional<SmartTerrain> = SimulationBoardManager.getInstance().getSmartTerrainByName(smartName);

    const distance: TDistance = npc.position().distance_to(smart!.position);
    const price: TCount = this.getTravelPriceByDistance(distance);

    return price <= registry.actor.money();
  }

  /**
   * todo: Description.
   */
  public isNotEnoughMoneyToTravel(
    actor: ClientObject,
    npc: ClientObject,
    dialogId: TStringId,
    phraseId: TStringId
  ): boolean {
    return !this.isEnoughMoneyToTravel(actor, npc, dialogId, phraseId);
  }

  /**
   * Travel together with squad to selected squad, pay them.
   * todo;
   */
  public onTravelToSpecificSmartWithSquad(
    actor: ClientObject,
    npc: ClientObject,
    dialogId: TStringId,
    phraseId: TStringId
  ): void {
    const simulationBoardManager: SimulationBoardManager = SimulationBoardManager.getInstance();
    const travelPhraseId: TStringId = string.sub(phraseId, 1, string.len(phraseId) - 3);
    const smartName: TName = this.smartNamesByPhraseId.get(travelPhraseId);
    const smartTerrain: Optional<SmartTerrain> = simulationBoardManager.getSmartTerrainByName(smartName)!;
    const squad: Optional<Squad> = getObjectSquad(npc);

    logger.info("Actor travel with squad:", npc.name(), smartName);

    createGameAutoSave(captions.st_save_uni_travel_generic);

    npc.stop_talk();

    level.disable_input();
    level.hide_indicators_safe();
    level.add_pp_effector(postProcessors.fade_in_out, 613, false);

    // todo: Alife distance vs abs distance.
    const distance: TDistance = getServerDistanceBetween(squad!, smartTerrain);
    const price: TCount = this.getTravelPriceByDistance(distance);

    actor.give_money(-price);
    NotificationManager.getInstance().sendMoneyRelocatedNotification(ENotificationDirection.OUT, price);

    this.isTravelTeleported = false;
    this.isTraveling = true;

    this.travelActorPath = smartTerrain.travelerActorPath;
    this.travelSquadPath = smartTerrain.travelerSquadPath;
    this.travelToSmartId = smartTerrain.id;
    this.travelSquad = squad;
    this.travelDistance = distance;
    this.travelingStartedAt = time_global();
  }

  /**
   * Travel together with squad to their assigned goal, just follow them.
   * todo;
   */
  public onTravelTogetherWithSquad(
    actor: ClientObject,
    npc: ClientObject,
    dialogId: TStringId,
    phraseId: TStringId
  ): void {
    createGameAutoSave(captions.st_save_uni_travel_generic);

    const squad: Squad = getObjectSquad(npc)!;
    const squadTargetId: Optional<TNumberId> = squad.assignedTargetId;
    const smartTerrain: SmartTerrain = alife().object<SmartTerrain>(squadTargetId!)!;

    npc.stop_talk();

    level.disable_input();
    level.hide_indicators_safe();
    level.add_pp_effector(postProcessors.fade_in_out, 613, false);

    this.isTravelTeleported = false;
    this.isTraveling = true;

    this.travelDistance = getServerDistanceBetween(squad, smartTerrain);
    this.travelActorPath = smartTerrain.travelerActorPath;
    this.travelSquadPath = smartTerrain.travelerSquadPath;
    this.travelToSmartId = smartTerrain.id;
    this.travelSquad = squad;
    this.travelingStartedAt = time_global();
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
    if (time_global() - (this.travelingStartedAt as number) < TravelManager.SMART_TRAVEL_TELEPORT_DELAY) {
      return;
    }

    if (!this.isTravelTeleported) {
      logger.info("Teleporting actor on travel:", this.travelSquadPath, this.travelActorPath);

      this.isTravelTeleported = true;

      const point: Patrol = new patrol(this.travelActorPath!);
      const direction: TDirection = -point.point(1).sub(point.point(0)).getH();
      const board: SimulationBoardManager = SimulationBoardManager.getInstance();

      for (const [, squad] of board.getSmartTerrainDescriptor(this.travelToSmartId!)!.assignedSquads) {
        if (getStoryIdByObjectId(squad.id) === null && isAnySquadMemberEnemyToActor(squad)) {
          board.exitSmartTerrain(squad, this.travelToSmartId);
          board.releaseSquad(squad);
        }
      }

      const currentSmartId: Optional<TNumberId> = this.travelSquad!.assignedSmartTerrainId;

      if (currentSmartId !== null) {
        board.assignSquadToSmartTerrain(this.travelSquad!, null);
        board.assignSquadToSmartTerrain(this.travelSquad!, currentSmartId);
      }

      const position: Vector = new patrol(this.travelSquadPath!).point(0);

      this.travelSquad!.setSquadPosition(position!);

      registry.actor.set_actor_direction(direction);
      registry.actor.set_actor_position(point.point(0));

      const timeTookInMinutes: TDuration = this.travelDistance! / 10;
      const hours: TDuration = math.floor(timeTookInMinutes / 60);
      const minutes: TDuration = timeTookInMinutes - hours * 60;

      level.change_game_time(0, hours, minutes);

      SurgeManager.getInstance().isTimeForwarded = true;

      logger.info("Forwarded time on travel:", this.travelSquadPath, this.travelActorPath);
    }

    // Wait till resolve.
    if (time_global() - (this.travelingStartedAt as number) < TravelManager.SMART_TRAVEL_RESOLVE_DELAY) {
      return;
    }

    this.isTraveling = false;

    this.travelingStartedAt = null;
    this.travelActorPath = null;
    this.travelSquadPath = null;
    this.travelSquad = null;
    this.travelDistance = null;
    this.travelToSmartId = null;

    level.show_weapon(true);
    level.enable_input();
    level.show_indicators();
  }
}
