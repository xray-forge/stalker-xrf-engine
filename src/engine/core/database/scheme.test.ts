import { describe, expect, it } from "@jest/globals";
import { MockGameObject } from "xray16/mocks";

import { IRegistryObjectState, TStatefulScheme } from "@/engine/core/database/database_types";
import { registerObject } from "@/engine/core/database/objects";
import {
  getActiveSchemeState,
  getActiveSchemeStateOptimistic,
  getSchemeState,
  getSchemeStateByKey,
  getSchemeStateByKeyOptimistic,
  getSchemeStateOptimistic,
  hasActiveScheme,
  hasSchemeState,
  setSchemeState,
  setSchemeStateByKey,
} from "@/engine/core/database/scheme";
import { ISchemeCombatState } from "@/engine/core/schemes/stalker/combat";
import { EScheme } from "@/engine/lib/types";
import { mockSchemeState } from "@/fixtures/engine";

function createCombatState(): ISchemeCombatState {
  return mockSchemeState<ISchemeCombatState>(EScheme.COMBAT, { enabled: true });
}

describe("ISchemeStateMap", () => {
  it("should cover every stateful scheme", () => {
    const isEveryStatefulSchemeMapped: Exclude<EScheme, EScheme.HEAR | EScheme.NIL> extends TStatefulScheme
      ? true
      : never = true;

    expect(isEveryStatefulSchemeMapped).toBe(true);
  });
});

describe("hasSchemeState", () => {
  it("should report whether a registered scheme state exists", () => {
    const state: IRegistryObjectState = registerObject(MockGameObject.mock());

    expect(hasSchemeState(state, EScheme.COMBAT)).toBe(false);

    setSchemeState(state, EScheme.COMBAT, createCombatState());

    expect(hasSchemeState(state, EScheme.COMBAT)).toBe(true);
  });
});

describe("setSchemeState", () => {
  it("should store state under its registered scheme key", () => {
    const state: IRegistryObjectState = registerObject(MockGameObject.mock());
    const combatState = createCombatState();

    setSchemeState(state, EScheme.COMBAT, combatState);

    expect(state[EScheme.COMBAT]).toBe(combatState);
  });
});

describe("setSchemeStateByKey", () => {
  it("should store state under a runtime scheme key", () => {
    const state: IRegistryObjectState = registerObject(MockGameObject.mock());
    const combatState = createCombatState();

    setSchemeStateByKey(state, EScheme.COMBAT, combatState);

    expect(state[EScheme.COMBAT]).toBe(combatState);
  });
});

describe("getSchemeState", () => {
  it("should return an optional scheme state", () => {
    const state: IRegistryObjectState = registerObject(MockGameObject.mock());

    expect(getSchemeState(state, EScheme.COMBAT)).toBeNil();

    const combatState = createCombatState();

    setSchemeState(state, EScheme.COMBAT, combatState);

    expect(getSchemeState(state, EScheme.COMBAT)).toBe(combatState);
  });
});

describe("getSchemeStateByKey", () => {
  it("should return an optional state for a runtime scheme key", () => {
    const state: IRegistryObjectState = registerObject(MockGameObject.mock());

    expect(getSchemeStateByKey(state, EScheme.COMBAT)).toBeNil();

    const combatState = createCombatState();

    setSchemeStateByKey(state, EScheme.COMBAT, combatState);

    expect(getSchemeStateByKey(state, EScheme.COMBAT)).toBe(combatState);
  });
});

describe("getSchemeStateOptimistic", () => {
  it("should return the indexed state without validation", () => {
    const state: IRegistryObjectState = registerObject(MockGameObject.mock());

    expect(getSchemeStateOptimistic(state, EScheme.COMBAT)).toBeNil();

    const combatState = createCombatState();

    setSchemeState(state, EScheme.COMBAT, combatState);

    expect(getSchemeStateOptimistic(state, EScheme.COMBAT)).toBe(combatState);
  });
});

describe("getSchemeStateByKeyOptimistic", () => {
  it("should return the indexed state for a runtime scheme key without validation", () => {
    const state: IRegistryObjectState = registerObject(MockGameObject.mock());

    expect(getSchemeStateByKeyOptimistic(state, EScheme.COMBAT)).toBeNil();

    const combatState = createCombatState();

    setSchemeStateByKey(state, EScheme.COMBAT, combatState);

    expect(getSchemeStateByKeyOptimistic(state, EScheme.COMBAT)).toBe(combatState);
  });
});

describe("hasActiveScheme", () => {
  it("should report whether an active scheme key exists", () => {
    const state: IRegistryObjectState = registerObject(MockGameObject.mock());

    expect(hasActiveScheme(state)).toBe(false);

    state.activeScheme = EScheme.COMBAT;

    expect(hasActiveScheme(state)).toBe(true);
  });
});

describe("getActiveSchemeState", () => {
  it("should return an optional active state", () => {
    const state: IRegistryObjectState = registerObject(MockGameObject.mock());

    expect(getActiveSchemeState(state)).toBeNull();

    const combatState = createCombatState();

    setSchemeState(state, EScheme.COMBAT, combatState);
    state.activeScheme = EScheme.COMBAT;

    expect(getActiveSchemeState(state)).toBe(combatState);
  });
});

describe("getActiveSchemeStateOptimistic", () => {
  it("should return the indexed active state without validation", () => {
    const state: IRegistryObjectState = registerObject(MockGameObject.mock());

    expect(getActiveSchemeStateOptimistic(state)).toBeNil();

    const combatState = createCombatState();

    setSchemeState(state, EScheme.COMBAT, combatState);
    state.activeScheme = EScheme.COMBAT;

    expect(getActiveSchemeStateOptimistic(state)).toBe(combatState);
  });
});
