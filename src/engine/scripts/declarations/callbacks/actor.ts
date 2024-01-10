import { getManager } from "@/engine/core/database";
import { TravelManager } from "@/engine/core/managers/travel";
import { extern } from "@/engine/core/utils/binding";
import { LuaLogger } from "@/engine/core/utils/logging";
import { GameObject, PhraseDialog, TLabel, TStringId } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

logger.format("Resolve and bind actor externals");

/**
 * Handle actor critical power levels.
 */
extern("on_actor_critical_power", () => {
  logger.format("Actor critical power");
});

/**
 * Handle actor max power event.
 */
extern("on_actor_critical_max_power", () => {
  logger.format("Actor critical max power");
});

/**
 * Handle actor bleeding.
 */
extern("on_actor_bleeding", () => {
  logger.format("Actor bleeding");
});

/**
 * Handle actor satiety levels change.
 */
extern("on_actor_satiety", () => {
  logger.format("Actor satiety");
});

/**
 * Handle actor radiation levels change.
 */
extern("on_actor_radiation", () => {
  logger.format("Actor radiation");
});

/**
 * Handle actor weapon jammed event.
 */
extern("on_actor_weapon_jammed", () => {
  logger.format("Actor weapon jammed");
});

/**
 * Handle actor weight change with cannot walk event.
 */
extern("on_actor_cant_walk_weight", () => {
  logger.format("Actor cant walk weight");
});

/**
 * Handle actor psy levels change.
 */
extern("on_actor_psy", () => {
  logger.format("Actor psy");
});

/**
 * Handle zone traveling with different set of callbacks.
 */
extern("travel_callbacks", {
  initialize_traveller_dialog: (dialog: PhraseDialog) => getManager(TravelManager).initializeTravellerDialog(dialog),
  can_start_traveling_dialogs: (actor: GameObject, object: GameObject) =>
    getManager(TravelManager).canStartTravelingDialogs(actor, object),
  get_squad_current_action_description: (actor: GameObject, object: GameObject): TLabel =>
    getManager(TravelManager).getSquadCurrentActionDescription(actor, object),
  can_actor_move_with_squad: (actor: GameObject, object: GameObject): boolean =>
    getManager(TravelManager).canActorMoveWithSquad(actor, object),
  can_squad_take_actor: (actor: GameObject, object: GameObject) =>
    getManager(TravelManager).canSquadTakeActor(actor, object),
  cannot_squad_take_actor: (object: GameObject, actor: GameObject, dialogId: TStringId, phraseId: TStringId) =>
    !getManager(TravelManager).canSquadTakeActor(object, actor, dialogId, phraseId),
  on_travel_together_with_squad: (object: GameObject, actor: GameObject, dialogId: TStringId, phraseId: TStringId) =>
    getManager(TravelManager).onTravelTogetherWithSquad(object, actor, dialogId, phraseId),
  on_travel_to_specific_smart_with_squad: (
    actor: GameObject,
    object: GameObject,
    dialogId: TStringId,
    phraseId: TStringId
  ) => getManager(TravelManager).onTravelToSpecificSmartWithSquad(actor, object, dialogId, phraseId),
  can_squad_travel: (object: GameObject, actor: GameObject, dialogId: TStringId, phraseId: TStringId) =>
    getManager(TravelManager).canSquadTravel(object, actor, dialogId, phraseId),
  cannot_squad_travel: (object: GameObject, actor: GameObject, dialogId: TStringId, phraseId: TStringId) =>
    !getManager(TravelManager).canSquadTravel(object, actor, dialogId, phraseId),
  can_negotiate_travel_to_smart: (
    actor: GameObject,
    object: GameObject,
    dialogId: TStringId,
    prevPhraseId: TStringId,
    phraseId: TStringId
  ) => getManager(TravelManager).canNegotiateTravelToSmart(actor, object, dialogId, prevPhraseId, phraseId),
  get_travel_cost: (actor: GameObject, object: GameObject, dialogId: TStringId, phraseId: TStringId): TLabel =>
    getManager(TravelManager).getTravelCostLabel(actor, object, dialogId, phraseId),
  is_enough_money_to_travel: (actor: GameObject, object: GameObject, dialogId: TStringId, phraseId: TStringId) =>
    getManager(TravelManager).isEnoughMoneyToTravel(actor, object, dialogId, phraseId),
  is_not_enough_money_to_travel: (actor: GameObject, object: GameObject, dialogId: TStringId, phraseId: TStringId) =>
    !getManager(TravelManager).isEnoughMoneyToTravel(actor, object, dialogId, phraseId),
});
