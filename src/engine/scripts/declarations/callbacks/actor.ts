import { TravelManager } from "@/engine/core/managers/travel";
import { extern } from "@/engine/core/utils/binding";
import { LuaLogger } from "@/engine/core/utils/logging";
import { ClientObject, PhraseDialog, TLabel, TStringId } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

logger.info("Resolve and bind actor externals");

/**
 * Handle actor critical power levels.
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
 * Handle zone traveling with different set of callbacks.
 */
extern("travel_callbacks", {
  initializeTravellerDialog: (dialog: PhraseDialog) => TravelManager.getInstance().initializeTravellerDialog(dialog),
  canStartTravelingDialogs: (actor: ClientObject, object: ClientObject) =>
    TravelManager.getInstance().canStartTravelingDialogs(actor, object),
  getSquadCurrentActionDescription: (actor: ClientObject, object: ClientObject): TLabel =>
    TravelManager.getInstance().getSquadCurrentActionDescription(actor, object),
  canActorMoveWithSquad: (actor: ClientObject, object: ClientObject): boolean =>
    TravelManager.getInstance().canActorMoveWithSquad(actor, object),
  canSquadTakeActor: (actor: ClientObject, object: ClientObject) =>
    TravelManager.getInstance().canSquadTakeActor(actor, object),
  cannotSquadTakeActor: (object: ClientObject, actor: ClientObject, dialogId: TStringId, phraseId: TStringId) =>
    !TravelManager.getInstance().canSquadTakeActor(object, actor, dialogId, phraseId),
  onTravelTogetherWithSquad: (object: ClientObject, actor: ClientObject, dialogId: TStringId, phraseId: TStringId) =>
    TravelManager.getInstance().onTravelTogetherWithSquad(object, actor, dialogId, phraseId),
  onTravelToSpecificSmartWithSquad: (
    actor: ClientObject,
    object: ClientObject,
    dialogId: TStringId,
    phraseId: TStringId
  ) => TravelManager.getInstance().onTravelToSpecificSmartWithSquad(actor, object, dialogId, phraseId),
  canSquadTravel: (object: ClientObject, actor: ClientObject, dialogId: TStringId, phraseId: TStringId) =>
    TravelManager.getInstance().canSquadTravel(object, actor, dialogId, phraseId),
  cannotSquadTravel: (object: ClientObject, actor: ClientObject, dialogId: TStringId, phraseId: TStringId) =>
    !TravelManager.getInstance().canSquadTravel(object, actor, dialogId, phraseId),
  canNegotiateTravelToSmart: (
    actor: ClientObject,
    object: ClientObject,
    dialogId: TStringId,
    prevPhraseId: TStringId,
    phraseId: TStringId
  ) => TravelManager.getInstance().canNegotiateTravelToSmart(actor, object, dialogId, prevPhraseId, phraseId),
  getTravelConst: (actor: ClientObject, object: ClientObject, dialogId: TStringId, phraseId: TStringId): TLabel =>
    TravelManager.getInstance().getTravelCostLabel(actor, object, dialogId, phraseId),
  isEnoughMoneyToTravel: (actor: ClientObject, object: ClientObject, dialogId: TStringId, phraseId: TStringId) =>
    TravelManager.getInstance().isEnoughMoneyToTravel(actor, object, dialogId, phraseId),
  isNotEnoughMoneyToTravel: (actor: ClientObject, object: ClientObject, dialogId: TStringId, phraseId: TStringId) =>
    !TravelManager.getInstance().isEnoughMoneyToTravel(actor, object, dialogId, phraseId),
});
