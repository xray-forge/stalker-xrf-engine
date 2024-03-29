import { afterAll, describe, expect, it, jest } from "@jest/globals";
import { game } from "xray16";

import {
  IBaseSchemeLogic,
  IBaseSchemeState,
  IRegistryObjectState,
  registerActor,
  registerObject,
  registerZone,
} from "@/engine/core/database";
import { SchemeIdle } from "@/engine/core/schemes/restrictor/sr_idle";
import { SchemeTimer } from "@/engine/core/schemes/restrictor/sr_timer";
import { TimerManager } from "@/engine/core/schemes/restrictor/sr_timer/TimerManager";
import { giveInfoPortion } from "@/engine/core/utils/info_portion";
import { addConditionToList, parseConditionsList } from "@/engine/core/utils/ini";
import { loadSchemeImplementation } from "@/engine/core/utils/scheme/scheme_setup";
import { switchObjectSchemeToSection, trySwitchToAnotherSection } from "@/engine/core/utils/scheme/scheme_switch";
import { NIL } from "@/engine/lib/constants/words";
import { EScheme, ESchemeCondition, GameObject, IniFile, LuaArray } from "@/engine/lib/types";
import { getSchemeAction, mockBaseSchemeLogic, mockSchemeState } from "@/fixtures/engine";
import { replaceFunctionMock } from "@/fixtures/jest";
import { MockGameObject, MockIniFile } from "@/fixtures/xray";
import { MockCTime } from "@/fixtures/xray/mocks/CTime.mock";

// todo: Complex logic switch
describe("trySwitchToAnotherSection util", () => {
  const originalTime: MockCTime = MockCTime.nowTime.copy();

  afterAll(() => {
    MockCTime.nowTime = originalTime;
  });

  it("trySwitchToAnotherSection should throw if no logic present / logic is not expected", () => {
    const object: GameObject = MockGameObject.mock();

    const firstState: IBaseSchemeState = mockSchemeState(EScheme.SR_IDLE, {
      logic: null,
    });
    const secondState: IBaseSchemeState = mockSchemeState(EScheme.SR_IDLE, {
      logic: new LuaTable(),
    });
    const thirdState: IBaseSchemeState = mockSchemeState(EScheme.SR_IDLE, {
      logic: new LuaTable(),
    });

    addConditionToList(
      secondState.logic as LuaArray<IBaseSchemeLogic>,
      0,
      mockBaseSchemeLogic({ name: "on_unexpected" })
    );
    addConditionToList(thirdState.logic as LuaArray<IBaseSchemeLogic>, 0, mockBaseSchemeLogic({ name: NIL }));

    expect(() => trySwitchToAnotherSection(object, firstState)).toThrow();
    expect(() => trySwitchToAnotherSection(object, secondState)).toThrow();
    expect(() => trySwitchToAnotherSection(object, thirdState)).toThrow();
  });

  it("trySwitchToAnotherSection should correctly check ON_ACTOR_DISTANCE_LESS_THAN", () => {
    const actor: GameObject = MockGameObject.mock();
    const object: GameObject = MockGameObject.mock();
    const objectState: IRegistryObjectState = registerObject(object);
    const ini: IniFile = MockIniFile.mock("test.ltx", {
      "sr_idle@next": {},
    });
    const schemeState: IBaseSchemeState = mockSchemeState(EScheme.SR_IDLE, {
      ini,
      logic: $fromArray([
        mockBaseSchemeLogic({
          name: ESchemeCondition.ON_ACTOR_DISTANCE_LESS_THAN,
          condlist: parseConditionsList("sr_idle@next"),
          p1: 10,
        }),
      ]),
    });

    registerActor(actor);
    loadSchemeImplementation(SchemeIdle);

    objectState.activeScheme = EScheme.SR_IDLE;
    objectState.activeSection = "sr_idle@default";

    expect(actor.position().distance_to(object.position())).toBe(20);

    trySwitchToAnotherSection(object, schemeState);
    expect(objectState.activeSection).toBe("sr_idle@default");

    replaceFunctionMock(object.see, () => true);
    trySwitchToAnotherSection(object, schemeState);
    expect(objectState.activeSection).toBe("sr_idle@default");

    replaceFunctionMock(object.alive, () => false);
    jest.spyOn(actor.position(), "distance_to").mockImplementation(() => 10);
    trySwitchToAnotherSection(object, schemeState);
    expect(objectState.activeSection).toBe("sr_idle@default");
    expect(actor.position().distance_to(object.position())).toBe(10);

    replaceFunctionMock(object.alive, () => true);
    trySwitchToAnotherSection(object, schemeState);
    expect(objectState.activeSection).toBe("sr_idle@next");
  });

  it("trySwitchToAnotherSection should correctly check ON_ACTOR_DISTANCE_LESS_THAN_NOT_VISIBLE", () => {
    const actor: GameObject = MockGameObject.mock();
    const object: GameObject = MockGameObject.mock();
    const objectState: IRegistryObjectState = registerObject(object);
    const ini: IniFile = MockIniFile.mock("test.ltx", {
      "sr_idle@next": {},
    });
    const schemeState: IBaseSchemeState = mockSchemeState(EScheme.SR_IDLE, {
      ini,
      logic: $fromArray([
        mockBaseSchemeLogic({
          name: ESchemeCondition.ON_ACTOR_DISTANCE_LESS_THAN_NOT_VISIBLE,
          condlist: parseConditionsList("sr_idle@next"),
          p1: 10,
        }),
      ]),
    });

    registerActor(actor);
    loadSchemeImplementation(SchemeIdle);

    objectState.activeScheme = EScheme.SR_IDLE;
    objectState.activeSection = "sr_idle@default";

    expect(actor.position().distance_to(object.position())).toBe(20);

    trySwitchToAnotherSection(object, schemeState);
    expect(objectState.activeSection).toBe("sr_idle@default");

    jest.spyOn(actor.position(), "distance_to").mockImplementation(() => 10);
    trySwitchToAnotherSection(object, schemeState);
    expect(actor.position().distance_to(object.position())).toBe(10);
    expect(object.see(actor)).toBe(false);
    expect(objectState.activeSection).toBe("sr_idle@next");
  });

  it("trySwitchToAnotherSection should correctly check ON_ACTOR_DISTANCE_GREATER_THAN", () => {
    const actor: GameObject = MockGameObject.mock();
    const object: GameObject = MockGameObject.mock();
    const objectState: IRegistryObjectState = registerObject(object);
    const ini: IniFile = MockIniFile.mock("test.ltx", {
      "sr_idle@next": {},
    });
    const schemeState: IBaseSchemeState = mockSchemeState(EScheme.SR_IDLE, {
      ini,
      logic: $fromArray([
        mockBaseSchemeLogic({
          name: ESchemeCondition.ON_ACTOR_DISTANCE_GREATER_THAN,
          condlist: parseConditionsList("sr_idle@next"),
          p1: 30,
        }),
      ]),
    });

    registerActor(actor);
    loadSchemeImplementation(SchemeIdle);

    objectState.activeScheme = EScheme.SR_IDLE;
    objectState.activeSection = "sr_idle@default";

    expect(actor.position().distance_to(object.position())).toBe(20);

    trySwitchToAnotherSection(object, schemeState);
    expect(objectState.activeSection).toBe("sr_idle@default");

    replaceFunctionMock(object.see, () => true);
    trySwitchToAnotherSection(object, schemeState);
    expect(objectState.activeSection).toBe("sr_idle@default");

    replaceFunctionMock(object.alive, () => false);
    jest.spyOn(actor.position(), "distance_to").mockImplementation(() => 31);
    trySwitchToAnotherSection(object, schemeState);
    expect(objectState.activeSection).toBe("sr_idle@default");
    expect(actor.position().distance_to(object.position())).toBe(31);

    replaceFunctionMock(object.alive, () => true);
    trySwitchToAnotherSection(object, schemeState);
    expect(objectState.activeSection).toBe("sr_idle@next");
  });

  it("trySwitchToAnotherSection should correctly check ON_ACTOR_DISTANCE_GREATER_THAN_NOT_VISIBLE", () => {
    const actor: GameObject = MockGameObject.mock();
    const object: GameObject = MockGameObject.mock();
    const objectState: IRegistryObjectState = registerObject(object);
    const ini: IniFile = MockIniFile.mock("test.ltx", {
      "sr_idle@next": {},
    });
    const schemeState: IBaseSchemeState = mockSchemeState(EScheme.SR_IDLE, {
      ini,
      logic: $fromArray([
        mockBaseSchemeLogic({
          name: ESchemeCondition.ON_ACTOR_DISTANCE_GREATER_THAN_NOT_VISIBLE,
          condlist: parseConditionsList("sr_idle@next"),
          p1: 30,
        }),
      ]),
    });

    registerActor(actor);
    loadSchemeImplementation(SchemeIdle);

    objectState.activeScheme = EScheme.SR_IDLE;
    objectState.activeSection = "sr_idle@default";

    expect(actor.position().distance_to(object.position())).toBe(20);

    trySwitchToAnotherSection(object, schemeState);
    expect(objectState.activeSection).toBe("sr_idle@default");

    jest.spyOn(actor.position(), "distance_to").mockImplementation(() => 31);
    trySwitchToAnotherSection(object, schemeState);
    expect(actor.position().distance_to(object.position())).toBe(31);
    expect(object.see(actor)).toBe(false);
    expect(objectState.activeSection).toBe("sr_idle@next");
  });

  it("trySwitchToAnotherSection should correctly check ON_ACTOR_INSIDE", () => {
    const actor: GameObject = MockGameObject.mock();
    const object: GameObject = MockGameObject.mock();
    const objectState: IRegistryObjectState = registerObject(object);
    const ini: IniFile = MockIniFile.mock("test.ltx", {
      "sr_idle@next": {},
    });
    const schemeState: IBaseSchemeState = mockSchemeState(EScheme.SR_IDLE, {
      ini,
      logic: $fromArray([
        mockBaseSchemeLogic({
          name: ESchemeCondition.ON_ACTOR_INSIDE,
          condlist: parseConditionsList("sr_idle@next"),
        }),
      ]),
    });

    registerActor(actor);
    loadSchemeImplementation(SchemeIdle);

    objectState.activeScheme = EScheme.SR_IDLE;
    objectState.activeSection = "sr_idle@default";

    expect(object.inside(actor.position())).toBe(false);

    trySwitchToAnotherSection(object, schemeState);
    expect(objectState.activeSection).toBe("sr_idle@default");

    replaceFunctionMock(object.inside, () => true);
    trySwitchToAnotherSection(object, schemeState);
    expect(objectState.activeSection).toBe("sr_idle@next");
  });

  it("trySwitchToAnotherSection should correctly check ON_ACTOR_OUTSIDE", () => {
    const actor: GameObject = MockGameObject.mock();
    const object: GameObject = MockGameObject.mock();
    const objectState: IRegistryObjectState = registerObject(object);
    const ini: IniFile = MockIniFile.mock("test.ltx", {
      "sr_idle@next": {},
    });
    const schemeState: IBaseSchemeState = mockSchemeState(EScheme.SR_IDLE, {
      ini,
      logic: $fromArray([
        mockBaseSchemeLogic({
          name: ESchemeCondition.ON_ACTOR_OUTSIDE,
          condlist: parseConditionsList("sr_idle@next"),
        }),
      ]),
    });

    registerActor(actor);
    loadSchemeImplementation(SchemeIdle);

    objectState.activeScheme = EScheme.SR_IDLE;
    objectState.activeSection = "sr_idle@default";

    replaceFunctionMock(object.inside, () => true);
    expect(object.inside(actor.position())).toBe(true);

    trySwitchToAnotherSection(object, schemeState);
    expect(objectState.activeSection).toBe("sr_idle@default");

    replaceFunctionMock(object.inside, () => false);
    trySwitchToAnotherSection(object, schemeState);
    expect(objectState.activeSection).toBe("sr_idle@next");
  });

  it("trySwitchToAnotherSection should correctly check ON_SIGNAL", () => {
    const actor: GameObject = MockGameObject.mock();
    const object: GameObject = MockGameObject.mock();
    const objectState: IRegistryObjectState = registerObject(object);
    const ini: IniFile = MockIniFile.mock("test.ltx", {
      "sr_idle@next": {},
    });
    const schemeState: IBaseSchemeState = mockSchemeState(EScheme.SR_IDLE, {
      ini,
      signals: null,
      logic: $fromArray([
        mockBaseSchemeLogic({
          name: ESchemeCondition.ON_SIGNAL,
          condlist: parseConditionsList("sr_idle@next"),
          p1: "expected",
        }),
      ]),
    });

    registerActor(actor);
    loadSchemeImplementation(SchemeIdle);

    objectState.activeScheme = EScheme.SR_IDLE;
    objectState.activeSection = "sr_idle@default";

    trySwitchToAnotherSection(object, schemeState);
    expect(objectState.activeSection).toBe("sr_idle@default");

    schemeState.signals = new LuaTable();
    schemeState.signals.set("another", true);
    trySwitchToAnotherSection(object, schemeState);
    expect(objectState.activeSection).toBe("sr_idle@default");

    schemeState.signals.set("expected", true);
    trySwitchToAnotherSection(object, schemeState);
    expect(objectState.activeSection).toBe("sr_idle@next");
  });

  it("trySwitchToAnotherSection should correctly check ON_INFO", () => {
    const actor: GameObject = MockGameObject.mock();
    const object: GameObject = MockGameObject.mock();
    const objectState: IRegistryObjectState = registerObject(object);
    const ini: IniFile = MockIniFile.mock("test.ltx", {
      "sr_idle@next": {},
    });
    const schemeState: IBaseSchemeState = mockSchemeState(EScheme.SR_IDLE, {
      ini,
      logic: $fromArray([
        mockBaseSchemeLogic({
          name: ESchemeCondition.ON_INFO,
          condlist: parseConditionsList("{+expected_info +additional_info} sr_idle@next, sr_idle@default"),
        }),
      ]),
    });

    registerActor(actor);
    loadSchemeImplementation(SchemeIdle);

    objectState.activeScheme = EScheme.SR_IDLE;
    objectState.activeSection = "sr_idle@default";

    trySwitchToAnotherSection(object, schemeState);
    expect(objectState.activeSection).toBe("sr_idle@default");

    giveInfoPortion("expected_info");
    trySwitchToAnotherSection(object, schemeState);
    expect(objectState.activeSection).toBe("sr_idle@default");

    giveInfoPortion("additional_info");
    trySwitchToAnotherSection(object, schemeState);
    expect(objectState.activeSection).toBe("sr_idle@next");
  });

  it("trySwitchToAnotherSection should correctly check ON_TIMER", () => {
    const actor: GameObject = MockGameObject.mock();
    const object: GameObject = MockGameObject.mock();
    const objectState: IRegistryObjectState = registerObject(object);
    const ini: IniFile = MockIniFile.mock("test.ltx", {
      "sr_idle@next": {},
    });
    const schemeState: IBaseSchemeState = mockSchemeState(EScheme.SR_IDLE, {
      ini,
      logic: $fromArray([
        mockBaseSchemeLogic({
          name: ESchemeCondition.ON_TIMER,
          condlist: parseConditionsList("sr_idle@next"),
          p1: 5000,
        }),
      ]),
    });

    registerActor(actor);
    loadSchemeImplementation(SchemeIdle);

    jest.spyOn(Date, "now").mockImplementation(() => 12_000);

    objectState.activationTime = 10_000;
    objectState.activeScheme = EScheme.SR_IDLE;
    objectState.activeSection = "sr_idle@default";

    trySwitchToAnotherSection(object, schemeState);
    expect(objectState.activeSection).toBe("sr_idle@default");

    jest.spyOn(Date, "now").mockImplementation(() => 14_999);
    trySwitchToAnotherSection(object, schemeState);
    expect(objectState.activeSection).toBe("sr_idle@default");

    jest.spyOn(Date, "now").mockImplementation(() => 15_000);
    trySwitchToAnotherSection(object, schemeState);
    expect(objectState.activeSection).toBe("sr_idle@next");
  });

  it("trySwitchToAnotherSection should correctly check ON_GAME_TIMER", () => {
    const actor: GameObject = MockGameObject.mock();
    const object: GameObject = MockGameObject.mock();
    const objectState: IRegistryObjectState = registerObject(object);
    const ini: IniFile = MockIniFile.mock("test.ltx", {
      "sr_idle@next": {},
    });
    const schemeState: IBaseSchemeState = mockSchemeState(EScheme.SR_IDLE, {
      ini,
      logic: $fromArray([
        mockBaseSchemeLogic({
          name: ESchemeCondition.ON_GAME_TIMER,
          condlist: parseConditionsList("sr_idle@next"),
          p1: 60 * 5,
        }),
      ]),
    });

    registerActor(actor);
    loadSchemeImplementation(SchemeIdle);

    jest.spyOn(game, "get_game_time").mockImplementation(() => MockCTime.mock(1, 1, 1, 1, 30, 60, 500));

    objectState.activationGameTime = game.get_game_time();
    objectState.activeScheme = EScheme.SR_IDLE;
    objectState.activeSection = "sr_idle@default";

    trySwitchToAnotherSection(object, schemeState);
    expect(objectState.activeSection).toBe("sr_idle@default");

    jest.spyOn(game, "get_game_time").mockImplementation(() => MockCTime.mock(1, 1, 1, 1, 33, 60, 500));
    trySwitchToAnotherSection(object, schemeState);
    expect(objectState.activeSection).toBe("sr_idle@default");

    jest.spyOn(game, "get_game_time").mockImplementation(() => MockCTime.mock(1, 1, 1, 1, 35, 60, 500));
    trySwitchToAnotherSection(object, schemeState);
    expect(objectState.activeSection).toBe("sr_idle@next");
  });

  it("trySwitchToAnotherSection should correctly check ON_ACTOR_IN_ZONE", () => {
    const actor: GameObject = MockGameObject.mock();
    const object: GameObject = MockGameObject.mock();
    const objectState: IRegistryObjectState = registerObject(object);
    const ini: IniFile = MockIniFile.mock("test.ltx", {
      "sr_idle@next": {},
    });
    const schemeState: IBaseSchemeState = mockSchemeState(EScheme.SR_IDLE, {
      ini,
      logic: $fromArray([
        mockBaseSchemeLogic({
          name: ESchemeCondition.ON_ACTOR_IN_ZONE,
          condlist: parseConditionsList("sr_idle@next"),
          p1: "zone_name",
        }),
      ]),
    });

    registerActor(actor);
    loadSchemeImplementation(SchemeIdle);

    const zone: GameObject = MockGameObject.mock({ name: "zone_name" });

    registerZone(zone);

    objectState.activeScheme = EScheme.SR_IDLE;
    objectState.activeSection = "sr_idle@default";

    expect(zone.inside(actor.position())).toBe(false);

    trySwitchToAnotherSection(object, schemeState);
    expect(objectState.activeSection).toBe("sr_idle@default");

    replaceFunctionMock(zone.inside, () => true);
    trySwitchToAnotherSection(object, schemeState);
    expect(objectState.activeSection).toBe("sr_idle@next");
  });

  it("trySwitchToAnotherSection should correctly check ON_ACTOR_NOT_IN_ZONE", () => {
    const actor: GameObject = MockGameObject.mock();
    const object: GameObject = MockGameObject.mock();
    const objectState: IRegistryObjectState = registerObject(object);
    const ini: IniFile = MockIniFile.mock("test.ltx", {
      "sr_idle@next": {},
    });
    const schemeState: IBaseSchemeState = mockSchemeState(EScheme.SR_IDLE, {
      ini,
      logic: $fromArray([
        mockBaseSchemeLogic({
          name: ESchemeCondition.ON_ACTOR_NOT_IN_ZONE,
          condlist: parseConditionsList("sr_idle@next"),
          p1: "zone_name",
        }),
      ]),
    });

    registerActor(actor);
    loadSchemeImplementation(SchemeIdle);

    const zone: GameObject = MockGameObject.mock({ name: "zone_name" });

    registerZone(zone);

    objectState.activeScheme = EScheme.SR_IDLE;
    objectState.activeSection = "sr_idle@default";

    replaceFunctionMock(zone.inside, () => true);
    expect(zone.inside(actor.position())).toBe(true);

    trySwitchToAnotherSection(object, schemeState);
    expect(objectState.activeSection).toBe("sr_idle@default");

    replaceFunctionMock(zone.inside, () => false);
    trySwitchToAnotherSection(object, schemeState);
    expect(objectState.activeSection).toBe("sr_idle@next");
  });

  it("trySwitchToAnotherSection should correctly check ON_NPC_IN_ZONE", () => {
    const actor: GameObject = MockGameObject.mock();
    const object: GameObject = MockGameObject.mock();
    const objectState: IRegistryObjectState = registerObject(object);
    const targetObject: GameObject = MockGameObject.mock();
    const ini: IniFile = MockIniFile.mock("test.ltx", {
      "sr_idle@next": {},
    });
    const schemeState: IBaseSchemeState = mockSchemeState(EScheme.SR_IDLE, {
      ini,
      logic: $fromArray([
        mockBaseSchemeLogic({
          name: ESchemeCondition.ON_NPC_IN_ZONE,
          condlist: parseConditionsList("sr_idle@next"),
          p1: "story_id",
          p2: "zone_name",
          objectId: targetObject.id(),
        }),
      ]),
    });

    registerActor(actor);
    loadSchemeImplementation(SchemeIdle);

    const zone: GameObject = MockGameObject.mock({ name: "zone_name" });

    registerZone(zone);

    objectState.activeScheme = EScheme.SR_IDLE;
    objectState.activeSection = "sr_idle@default";

    replaceFunctionMock(zone.inside, () => false);
    expect(zone.inside(targetObject.position())).toBe(false);

    trySwitchToAnotherSection(object, schemeState);
    expect(objectState.activeSection).toBe("sr_idle@default");

    replaceFunctionMock(zone.inside, () => true);
    trySwitchToAnotherSection(object, schemeState);
    expect(objectState.activeSection).toBe("sr_idle@next");
  });

  it("trySwitchToAnotherSection should correctly check ON_NPC_NOT_IN_ZONE", () => {
    const actor: GameObject = MockGameObject.mock();
    const object: GameObject = MockGameObject.mock();
    const objectState: IRegistryObjectState = registerObject(object);
    const targetObject: GameObject = MockGameObject.mock();
    const ini: IniFile = MockIniFile.mock("test.ltx", {
      "sr_idle@next": {},
    });
    const schemeState: IBaseSchemeState = mockSchemeState(EScheme.SR_IDLE, {
      ini,
      logic: $fromArray([
        mockBaseSchemeLogic({
          name: ESchemeCondition.ON_NPC_NOT_IN_ZONE,
          condlist: parseConditionsList("sr_idle@next"),
          p1: "story_id",
          p2: "zone_name",
          objectId: targetObject.id(),
        }),
      ]),
    });

    registerActor(actor);
    loadSchemeImplementation(SchemeIdle);

    const zone: GameObject = MockGameObject.mock({ name: "zone_name" });

    registerZone(zone);

    objectState.activeScheme = EScheme.SR_IDLE;
    objectState.activeSection = "sr_idle@default";

    replaceFunctionMock(zone.inside, () => true);
    expect(zone.inside(targetObject.position())).toBe(true);

    trySwitchToAnotherSection(object, schemeState);
    expect(objectState.activeSection).toBe("sr_idle@default");

    replaceFunctionMock(zone.inside, () => false);
    trySwitchToAnotherSection(object, schemeState);
    expect(objectState.activeSection).toBe("sr_idle@next");
  });

  it("trySwitchToAnotherSection should correctly handle multiple conditions", () => {
    const actor: GameObject = MockGameObject.mock();
    const object: GameObject = MockGameObject.mock();
    const objectState: IRegistryObjectState = registerObject(object);
    const ini: IniFile = MockIniFile.mock("test.ltx", {
      "sr_idle@default": {},
      "sr_idle@first": {},
      "sr_idle@second": {},
    });
    const schemeState: IBaseSchemeState = mockSchemeState(EScheme.SR_IDLE, {
      ini,
      signals: new LuaTable(),
      logic: $fromArray([
        mockBaseSchemeLogic({
          name: ESchemeCondition.ON_SIGNAL,
          condlist: parseConditionsList("sr_idle@first"),
          p1: "test_signal",
        }),
        mockBaseSchemeLogic({
          name: ESchemeCondition.ON_INFO,
          condlist: parseConditionsList("{+expected_info} sr_idle@second, sr_idle@default"),
        }),
      ]),
    });

    registerActor(actor);
    loadSchemeImplementation(SchemeIdle);

    objectState.activeScheme = EScheme.SR_IDLE;
    objectState.activeSection = "sr_idle@default";

    trySwitchToAnotherSection(object, schemeState);
    expect(objectState.activeSection).toBe("sr_idle@default");

    giveInfoPortion("expected_info");
    trySwitchToAnotherSection(object, schemeState);
    expect(objectState.activeSection).toBe("sr_idle@second");

    schemeState.signals?.set("test_signal", true);
    trySwitchToAnotherSection(object, schemeState);
    expect(objectState.activeSection).toBe("sr_idle@first");
  });
});

describe("switchObjectSchemeToSection util", () => {
  const originalTime: MockCTime = MockCTime.nowTime.copy();

  afterAll(() => {
    MockCTime.nowTime = originalTime;
  });

  it("should correctly reset base schemes", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);
    const schemeState: IBaseSchemeState = mockSchemeState(EScheme.SR_IDLE, {
      actions: new LuaTable(),
    });
    const ini: IniFile = MockIniFile.mock("test.ltx", {
      "sr_idle@active": {},
      "sr_timer@next": {},
    });

    loadSchemeImplementation(SchemeIdle);
    loadSchemeImplementation(SchemeTimer);

    state.activeScheme = EScheme.SR_IDLE;
    state.activeSection = "sr_idle@active";
    state[EScheme.SR_IDLE] = schemeState;

    const handler = {
      deactivate: jest.fn(),
    };

    schemeState.actions = new LuaTable();
    schemeState.actions.set(handler, true);

    expect(switchObjectSchemeToSection(object, ini, "")).toBe(false);
    expect(switchObjectSchemeToSection(object, ini, null)).toBe(false);
    expect(handler.deactivate).not.toHaveBeenCalled();

    jest.spyOn(TimerManager.prototype, "activate").mockImplementation(jest.fn);

    expect(switchObjectSchemeToSection(object, ini, "sr_timer@next")).toBe(true);
    expect(handler.deactivate).toHaveBeenCalledTimes(1);
    expect(state.activeScheme).toBe(EScheme.SR_TIMER);
    expect(state.activeSection).toBe("sr_timer@next");
    expect(state[EScheme.SR_TIMER]).toBeDefined();
    expect(getSchemeAction(state[EScheme.SR_TIMER] as IBaseSchemeState).activate).toHaveBeenCalledTimes(1);
  });
});
