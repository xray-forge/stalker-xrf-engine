import { beforeAll, describe, expect, it, jest } from "@jest/globals";

import { getManager } from "@/engine/core/database";
import { TravelManager } from "@/engine/core/managers/travel";
import { AnyArgs, AnyObject, GameObject, TName } from "@/engine/lib/types";
import { callBinding, checkBinding } from "@/fixtures/engine";
import { MockGameObject } from "@/fixtures/xray";

function callTravelBinding(name: TName, args: AnyArgs = []): unknown {
  return callBinding(name, args, (_G as AnyObject)["travel_callbacks"]);
}

describe("actor external callbacks", () => {
  beforeAll(() => {
    require("@/engine/scripts/declarations/callbacks/actor");
  });

  it("should correctly inject external methods for game", () => {
    checkBinding("on_actor_critical_power");
    checkBinding("on_actor_critical_max_power");
    checkBinding("on_actor_bleeding");
    checkBinding("on_actor_satiety");
    checkBinding("on_actor_radiation");
    checkBinding("on_actor_weapon_jammed");
    checkBinding("on_actor_cant_walk_weight");
    checkBinding("on_actor_psy");
    checkBinding("travel_callbacks");
  });

  it("on_actor_critical_power should correctly handle event", () => {
    expect(() => callBinding("on_actor_critical_power", [])).not.toThrow();
  });

  it("on_actor_critical_max_power should correctly handle event", () => {
    expect(() => callBinding("on_actor_critical_max_power", [])).not.toThrow();
  });

  it("on_actor_bleeding should correctly handle event", () => {
    expect(() => callBinding("on_actor_bleeding", [])).not.toThrow();
  });

  it("on_actor_satiety should correctly handle event", () => {
    expect(() => callBinding("on_actor_satiety", [])).not.toThrow();
  });

  it("on_actor_radiation should correctly handle event", () => {
    expect(() => callBinding("on_actor_radiation", [])).not.toThrow();
  });

  it("on_actor_weapon_jammed should correctly handle event", () => {
    expect(() => callBinding("on_actor_weapon_jammed", [])).not.toThrow();
  });

  it("on_actor_cant_walk_weight should correctly handle event", () => {
    expect(() => callBinding("on_actor_cant_walk_weight", [])).not.toThrow();
  });

  it("on_actor_psy should correctly handle event", () => {
    expect(() => callBinding("on_actor_psy", [])).not.toThrow();
  });

  it("travel_callbacks should correctly link travel manager", () => {
    const travelManager: TravelManager = getManager(TravelManager);

    jest.spyOn(travelManager, "initializeTravellerDialog").mockImplementation(jest.fn());
    jest.spyOn(travelManager, "canStartTravelingDialogs").mockImplementation(jest.fn(() => true));
    jest.spyOn(travelManager, "getSquadCurrentActionDescription").mockImplementation(jest.fn(() => "action"));
    jest.spyOn(travelManager, "canActorMoveWithSquad").mockImplementation(jest.fn(() => true));
    jest.spyOn(travelManager, "canSquadTakeActor").mockImplementation(jest.fn(() => true));
    jest.spyOn(travelManager, "onTravelTogetherWithSquad").mockImplementation(jest.fn(() => true));
    jest.spyOn(travelManager, "onTravelToSpecificSmartWithSquad").mockImplementation(jest.fn(() => true));
    jest.spyOn(travelManager, "canSquadTravel").mockImplementation(jest.fn(() => true));
    jest.spyOn(travelManager, "canNegotiateTravelToSmart").mockImplementation(jest.fn(() => true));
    jest.spyOn(travelManager, "getTravelCostLabel").mockImplementation(jest.fn(() => "5000"));
    jest.spyOn(travelManager, "isEnoughMoneyToTravel").mockImplementation(jest.fn(() => true));

    const first: GameObject = MockGameObject.mock();
    const second: GameObject = MockGameObject.mock();

    callTravelBinding("initialize_traveller_dialog", ["test"]);
    expect(travelManager.initializeTravellerDialog).toHaveBeenCalledWith("test");

    callTravelBinding("can_start_traveling_dialogs", [first, second]);
    expect(travelManager.canStartTravelingDialogs).toHaveBeenCalledWith(first, second);

    callTravelBinding("get_squad_current_action_description", [first, second]);
    expect(travelManager.getSquadCurrentActionDescription).toHaveBeenCalledWith(first, second);

    callTravelBinding("can_actor_move_with_squad", [first, second]);
    expect(travelManager.canActorMoveWithSquad).toHaveBeenCalledWith(first, second);

    expect(callTravelBinding("can_squad_take_actor", [first, second])).toBe(true);
    expect(travelManager.canSquadTakeActor).toHaveBeenCalledWith(first, second);

    expect(callTravelBinding("cannot_squad_take_actor", [first, second, "test", "phrase"])).toBe(false);
    expect(travelManager.canSquadTakeActor).toHaveBeenCalledWith(first, second, "test", "phrase");

    callTravelBinding("on_travel_together_with_squad", [first, second, "test", "phrase"]);
    expect(travelManager.onTravelTogetherWithSquad).toHaveBeenCalledWith(first, second, "test", "phrase");

    callTravelBinding("on_travel_to_specific_smart_with_squad", [first, second, "test", "phrase"]);
    expect(travelManager.onTravelToSpecificSmartWithSquad).toHaveBeenCalledWith(first, second, "test", "phrase");

    expect(callTravelBinding("can_squad_travel", [first, second, "test", "phrase"])).toBe(true);
    expect(travelManager.canSquadTravel).toHaveBeenCalledWith(first, second, "test", "phrase");

    expect(callTravelBinding("cannot_squad_travel", [first, second, "test", "phrase"])).toBe(false);
    expect(travelManager.canSquadTravel).toHaveBeenCalledWith(first, second, "test", "phrase");

    expect(callTravelBinding("can_negotiate_travel_to_smart", [first, second, "test", "p-phrase", "n-phrase"])).toBe(
      true
    );
    expect(travelManager.canNegotiateTravelToSmart).toHaveBeenCalledWith(first, second, "test", "p-phrase", "n-phrase");

    expect(callTravelBinding("get_travel_cost", [first, second, "test", "phrase"])).toBe("5000");
    expect(travelManager.getTravelCostLabel).toHaveBeenCalledWith(first, second, "test", "phrase");

    expect(callTravelBinding("is_enough_money_to_travel", [first, second, "test", "phrase"])).toBe(true);
    expect(travelManager.isEnoughMoneyToTravel).toHaveBeenCalledWith(first, second, "test", "phrase");

    expect(callTravelBinding("is_not_enough_money_to_travel", [first, second, "test", "phrase"])).toBe(false);
    expect(travelManager.isEnoughMoneyToTravel).toHaveBeenCalledWith(first, second, "test", "phrase");
  });
});
