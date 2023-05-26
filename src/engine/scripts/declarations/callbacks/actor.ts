import { CPhraseDialog, game_object } from "xray16";

import { TravelManager } from "@/engine/core/managers/interaction/TravelManager";
import { extern } from "@/engine/core/utils/binding";
import { LuaLogger } from "@/engine/core/utils/logging";
import { TLabel, TStringId } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

logger.info("Resolve and bind actor externals");

/**
 * todo;
 */
extern("on_actor_critical_power", () => {
  logger.info("Actor critical power");
});

/**
 * todo;
 */
extern("on_actor_critical_max_power", () => {
  logger.info("Actor critical max power");
});

/**
 * todo;
 */
extern("on_actor_bleeding", () => {
  logger.info("Actor bleeding");
});

/**
 * todo;
 */
extern("on_actor_satiety", () => {
  logger.info("Actor satiety");
});

/**
 * todo;
 */
extern("on_actor_radiation", () => {
  logger.info("Actor radiation");
});

/**
 * todo;
 */
extern("on_actor_weapon_jammed", () => {
  logger.info("Actor weapon jammed");
});

/**
 * todo;
 */
extern("on_actor_cant_walk_weight", () => {
  logger.info("Actor cant walk weight");
});

/**
 * todo;
 */
extern("on_actor_psy", () => {
  logger.info("Actor psy");
});

/**
 * todo;
 */
extern("travel_callbacks", {
  initializeTravellerDialog: (dialog: CPhraseDialog) => TravelManager.getInstance().initializeTravellerDialog(dialog),
  canStartTravelingDialogs: (actor: game_object, npc: game_object) =>
    TravelManager.getInstance().canStartTravelingDialogs(actor, npc),
  getSquadCurrentActionDescription: (actor: game_object, npc: game_object): TLabel =>
    TravelManager.getInstance().getSquadCurrentActionDescription(actor, npc),
  canActorMoveWithSquad: (actor: game_object, npc: game_object): boolean =>
    TravelManager.getInstance().canActorMoveWithSquad(actor, npc),
  canSquadTakeActor: (actor: game_object, npc: game_object) =>
    TravelManager.getInstance().canSquadTakeActor(actor, npc),
  cannotSquadTakeActor: (npc: game_object, actor: game_object, dialogId: TStringId, phraseId: TStringId) =>
    TravelManager.getInstance().cannotSquadTakeActor(npc, actor, dialogId, phraseId),
  onTravelTogetherWithSquad: (npc: game_object, actor: game_object, dialogId: TStringId, phraseId: TStringId) =>
    TravelManager.getInstance().onTravelTogetherWithSquad(npc, actor, dialogId, phraseId),
  onTravelToSpecificSmartWithSquad: (actor: game_object, npc: game_object, dialogId: TStringId, phraseId: TStringId) =>
    TravelManager.getInstance().onTravelToSpecificSmartWithSquad(actor, npc, dialogId, phraseId),
  canSquadTravel: (npc: game_object, actor: game_object, dialogId: TStringId, phraseId: TStringId) =>
    TravelManager.getInstance().canSquadTravel(npc, actor, dialogId, phraseId),
  canNegotiateTravelToSmart: (
    actor: game_object,
    npc: game_object,
    dialogId: TStringId,
    prevPhraseId: TStringId,
    phraseId: TStringId
  ) => TravelManager.getInstance().canNegotiateTravelToSmart(actor, npc, dialogId, prevPhraseId, phraseId),
  getTravelConst: (actor: game_object, npc: game_object, dialogId: TStringId, phraseId: TStringId): TLabel =>
    TravelManager.getInstance().getTravelConst(actor, npc, dialogId, phraseId),
  isEnoughMoneyToTravel: (actor: game_object, npc: game_object, dialogId: TStringId, phraseId: TStringId) =>
    TravelManager.getInstance().isEnoughMoneyToTravel(actor, npc, dialogId, phraseId),
  isNotEnoughMoneyToTravel: (actor: game_object, npc: game_object, dialogId: TStringId, phraseId: TStringId) =>
    TravelManager.getInstance().isNotEnoughMoneyToTravel(actor, npc, dialogId, phraseId),
  cannotSquadTravel: (npc: game_object, actor: game_object, dialogId: TStringId, phraseId: TStringId) =>
    TravelManager.getInstance().cannotSquadTravel(npc, actor, dialogId, phraseId),
});
