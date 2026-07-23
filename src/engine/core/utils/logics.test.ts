import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";
import { resetFunctionMock } from "xray16/testing/utils";

import { EActionId } from "@/engine/core/ai/planner/types/motivator_actions";
import { IRegistryObjectState, registerObject, registry } from "@/engine/core/database";
import { pickSectionFromCondList } from "@/engine/core/ini";
import { trySwitchToAnotherSection } from "@/engine/core/schemes/runtime";
import { ISchemeCombatState, SchemeCombat } from "@/engine/core/schemes/stalker/combat";
import { ISchemeWalkerState } from "@/engine/core/schemes/stalker/walker";
import { ILogicsOverrides, setSchemeState } from "@/engine/core/schemes/state";
import { EScheme } from "@/engine/core/schemes/types";
import { updateStalkerLogic } from "@/engine/core/utils/logics";
import { mockRegisteredActor, mockSchemeState, resetRegistry } from "@/fixtures/engine";

jest.mock("@/engine/core/ini/ini_config");
jest.mock("@/engine/core/schemes/runtime/scheme_switch", () => ({ trySwitchToAnotherSection: jest.fn() }));

describe("updateStalkerLogic", () => {
  beforeEach(() => {
    resetRegistry();
    mockRegisteredActor();
    resetFunctionMock(pickSectionFromCondList);
    resetFunctionMock(trySwitchToAnotherSection);
    jest.spyOn(SchemeCombat, "setCombatType").mockImplementation(jest.fn());
  });

  it("should update the active scheme when the object is alive and not in a combat planner action", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);
    const activeState = mockSchemeState<ISchemeWalkerState>(EScheme.WALKER);
    const combatState = mockSchemeState<ISchemeCombatState>(EScheme.COMBAT);

    state.activeScheme = EScheme.WALKER;
    setSchemeState(state, EScheme.WALKER, activeState);
    setSchemeState(state, EScheme.COMBAT, combatState);

    updateStalkerLogic(object, state);

    expect(trySwitchToAnotherSection).toHaveBeenCalledWith(object, activeState);
    expect(SchemeCombat.setCombatType).not.toHaveBeenCalled();
  });

  it("should resolve combat overrides and avoid a second active-scheme switch after a combat switch", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);
    const activeState = mockSchemeState<ISchemeWalkerState>(EScheme.WALKER);
    const combatState = mockSchemeState<ISchemeCombatState>(EScheme.COMBAT, { logic: new LuaTable() });
    const overrides: ILogicsOverrides = {
      combatIgnore: null,
      combatIgnoreKeepWhenAttacked: null,
      combatType: { condlist: new LuaTable(), name: "combat_type", objectId: null, p1: null, p2: null },
      heliHunter: null,
      maxPostCombatTime: 0,
      minPostCombatTime: 0,
      onCombat: { condlist: new LuaTable(), name: "on_combat", objectId: null, p1: null, p2: null },
      onOffline: null,
      scriptCombatType: null,
      soundgroup: null,
    };

    state.activeScheme = EScheme.WALKER;
    state.overrides = overrides;
    setSchemeState(state, EScheme.WALKER, activeState);
    setSchemeState(state, EScheme.COMBAT, combatState);
    MockGameObject.asMock(object).objectActionManager.isInitialized = true;
    MockGameObject.asMock(object).objectActionManager.currentActionId = EActionId.COMBAT;
    (trySwitchToAnotherSection as jest.Mock).mockReturnValue(true);

    updateStalkerLogic(object, state);

    expect(pickSectionFromCondList).toHaveBeenCalledWith(registry.actor, object, overrides.onCombat!.condlist);
    expect(trySwitchToAnotherSection).toHaveBeenCalledWith(object, combatState);
    expect(trySwitchToAnotherSection).toHaveBeenCalledTimes(1);
    expect(SchemeCombat.setCombatType).not.toHaveBeenCalled();
  });

  it("should apply a combat override and continue updating the active scheme when combat switching fails", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);
    const activeState = mockSchemeState<ISchemeWalkerState>(EScheme.WALKER);
    const combatState = mockSchemeState<ISchemeCombatState>(EScheme.COMBAT, { logic: new LuaTable() });
    const overrides: ILogicsOverrides = {
      combatIgnore: null,
      combatIgnoreKeepWhenAttacked: null,
      combatType: { condlist: new LuaTable(), name: "combat_type", objectId: null, p1: null, p2: null },
      heliHunter: null,
      maxPostCombatTime: 0,
      minPostCombatTime: 0,
      onCombat: null,
      onOffline: null,
      scriptCombatType: null,
      soundgroup: null,
    };

    state.activeScheme = EScheme.WALKER;
    state.overrides = overrides;
    setSchemeState(state, EScheme.WALKER, activeState);
    setSchemeState(state, EScheme.COMBAT, combatState);
    MockGameObject.asMock(object).objectActionManager.isInitialized = true;
    MockGameObject.asMock(object).objectActionManager.currentActionId = EActionId.COMBAT;
    (trySwitchToAnotherSection as jest.Mock).mockReturnValue(false);

    updateStalkerLogic(object, state);

    expect(SchemeCombat.setCombatType).toHaveBeenCalledWith(object, registry.actor, overrides);
    expect(trySwitchToAnotherSection).toHaveBeenNthCalledWith(1, object, combatState);
    expect(trySwitchToAnotherSection).toHaveBeenNthCalledWith(2, object, activeState);
  });

  it("should use combat scheme settings when a combat action has no logic overrides", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);
    const activeState = mockSchemeState<ISchemeWalkerState>(EScheme.WALKER);
    const combatState = mockSchemeState<ISchemeCombatState>(EScheme.COMBAT, { logic: new LuaTable() });

    state.activeScheme = EScheme.WALKER;
    setSchemeState(state, EScheme.WALKER, activeState);
    setSchemeState(state, EScheme.COMBAT, combatState);
    MockGameObject.asMock(object).objectActionManager.isInitialized = true;
    MockGameObject.asMock(object).objectActionManager.currentActionId = EActionId.COMBAT;
    (trySwitchToAnotherSection as jest.Mock).mockReturnValue(true);

    updateStalkerLogic(object, state);

    expect(SchemeCombat.setCombatType).toHaveBeenCalledWith(object, registry.actor, combatState);
    expect(trySwitchToAnotherSection).toHaveBeenCalledWith(object, activeState);
    expect(trySwitchToAnotherSection).toHaveBeenCalledTimes(1);
  });

  it("should update combat type when no active scheme can be updated", () => {
    const object: GameObject = MockGameObject.mock({ alive: false });
    const state: IRegistryObjectState = registerObject(object);
    const combatState = mockSchemeState<ISchemeCombatState>(EScheme.COMBAT);

    setSchemeState(state, EScheme.COMBAT, combatState);

    updateStalkerLogic(object, state);

    expect(SchemeCombat.setCombatType).toHaveBeenCalledWith(object, registry.actor, combatState);
    expect(trySwitchToAnotherSection).not.toHaveBeenCalled();
  });
});
