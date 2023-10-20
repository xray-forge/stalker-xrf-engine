import { TravelManager } from "@/engine/core/managers/travel";
import { extern } from "@/engine/core/utils/binding";
import { LuaLogger } from "@/engine/core/utils/logging";
import { GameObject, PhraseDialog, TLabel, TStringId } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

logger.info("Resolve and bind actor externals");

/**
 * Handle actor critical power levels.
 */
extern("on_actor_critical_power", () => {
  logger.info("Actor critical power");
});

/**
 * Handle actor max power event.
 */
extern("on_actor_critical_max_power", () => {
  logger.info("Actor critical max power");
});

/**
 * Handle actor bleeding.
 */
extern("on_actor_bleeding", () => {
  logger.info("Actor bleeding");
});

/**
 * Handle actor satiety levels change.
 */
extern("on_actor_satiety", () => {
  logger.info("Actor satiety");
});

/**
 * Handle actor radiation levels change.
 */
extern("on_actor_radiation", () => {
  logger.info("Actor radiation");
});

/**
 * Handle actor weapon jammed event.
 */
extern("on_actor_weapon_jammed", () => {
  logger.info("Actor weapon jammed");
});

/**
 * Handle actor weight change with cannot walk event.
 */
extern("on_actor_cant_walk_weight", () => {
  logger.info("Actor cant walk weight");
});

/**
 * Handle actor psy levels change.
 */
extern("on_actor_psy", () => {
  logger.info("Actor psy");
});

/**
 * Handle zone traveling with different set of callbacks.
 */
extern("travel_callbacks", {
  initializeTravellerDialog: (dialog: PhraseDialog) => TravelManager.getInstance().initializeTravellerDialog(dialog),
  canStartTravelingDialogs: (actor: GameObject, object: GameObject) =>
    TravelManager.getInstance().canStartTravelingDialogs(actor, object),
  getSquadCurrentActionDescription: (actor: GameObject, object: GameObject): TLabel =>
    TravelManager.getInstance().getSquadCurrentActionDescription(actor, object),
  canActorMoveWithSquad: (actor: GameObject, object: GameObject): boolean =>
    TravelManager.getInstance().canActorMoveWithSquad(actor, object),
  canSquadTakeActor: (actor: GameObject, object: GameObject) =>
    TravelManager.getInstance().canSquadTakeActor(actor, object),
  cannotSquadTakeActor: (object: GameObject, actor: GameObject, dialogId: TStringId, phraseId: TStringId) =>
    !TravelManager.getInstance().canSquadTakeActor(object, actor, dialogId, phraseId),
  onTravelTogetherWithSquad: (object: GameObject, actor: GameObject, dialogId: TStringId, phraseId: TStringId) =>
    TravelManager.getInstance().onTravelTogetherWithSquad(object, actor, dialogId, phraseId),
  onTravelToSpecificSmartWithSquad: (actor: GameObject, object: GameObject, dialogId: TStringId, phraseId: TStringId) =>
    TravelManager.getInstance().onTravelToSpecificSmartWithSquad(actor, object, dialogId, phraseId),
  canSquadTravel: (object: GameObject, actor: GameObject, dialogId: TStringId, phraseId: TStringId) =>
    TravelManager.getInstance().canSquadTravel(object, actor, dialogId, phraseId),
  cannotSquadTravel: (object: GameObject, actor: GameObject, dialogId: TStringId, phraseId: TStringId) =>
    !TravelManager.getInstance().canSquadTravel(object, actor, dialogId, phraseId),
  canNegotiateTravelToSmart: (
    actor: GameObject,
    object: GameObject,
    dialogId: TStringId,
    prevPhraseId: TStringId,
    phraseId: TStringId
  ) => TravelManager.getInstance().canNegotiateTravelToSmart(actor, object, dialogId, prevPhraseId, phraseId),
  getTravelCost: (actor: GameObject, object: GameObject, dialogId: TStringId, phraseId: TStringId): TLabel =>
    TravelManager.getInstance().getTravelCostLabel(actor, object, dialogId, phraseId),
  isEnoughMoneyToTravel: (actor: GameObject, object: GameObject, dialogId: TStringId, phraseId: TStringId) =>
    TravelManager.getInstance().isEnoughMoneyToTravel(actor, object, dialogId, phraseId),
  isNotEnoughMoneyToTravel: (actor: GameObject, object: GameObject, dialogId: TStringId, phraseId: TStringId) =>
    !TravelManager.getInstance().isEnoughMoneyToTravel(actor, object, dialogId, phraseId),
});
