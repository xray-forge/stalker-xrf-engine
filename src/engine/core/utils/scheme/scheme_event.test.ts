import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { IBaseSchemeState, IRegistryObjectState, registerObject, registry } from "@/engine/core/database";
import { emitSchemeEvent, setObjectActiveSchemeSignal } from "@/engine/core/utils/scheme/scheme_event";
import { EScheme, ESchemeEvent, GameObject } from "@/engine/lib/types";
import { mockSchemeState, resetRegistry } from "@/fixtures/engine/mocks";
import { MockGameObject } from "@/fixtures/xray";

describe("emitSchemeEvent util", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should correctly emit events", () => {
    const object: GameObject = MockGameObject.mock();
    const schemeState: IBaseSchemeState = mockSchemeState(EScheme.MEET);
    const mockAction = {
      activate: jest.fn(),
      deactivate: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      onDeath: jest.fn(),
      onCutscene: jest.fn(),
      onCombat: jest.fn(),
      onExtrapolate: jest.fn(),
      onSwitchOnline: jest.fn(),
      onSwitchOffline: jest.fn(),
      onHit: jest.fn(),
      onUse: jest.fn(),
      onWaypoint: jest.fn(),
    };

    expect(() => emitSchemeEvent(schemeState, ESchemeEvent.ACTIVATE)).not.toThrow();

    schemeState.actions = new LuaTable();
    expect(() => emitSchemeEvent(schemeState, ESchemeEvent.ACTIVATE)).not.toThrow();

    schemeState.actions.set(mockAction, true);

    emitSchemeEvent(schemeState, ESchemeEvent.ACTIVATE, object, 1, 2, 3);
    expect(mockAction.activate).toHaveBeenCalledWith(object, 1, 2, 3);

    emitSchemeEvent(schemeState, ESchemeEvent.DEACTIVATE);
    expect(mockAction.deactivate).toHaveBeenCalledTimes(1);

    emitSchemeEvent(schemeState, ESchemeEvent.DEATH);
    expect(mockAction.onDeath).toHaveBeenCalledTimes(1);

    emitSchemeEvent(schemeState, ESchemeEvent.CUTSCENE);
    expect(mockAction.onCutscene).toHaveBeenCalledTimes(1);

    emitSchemeEvent(schemeState, ESchemeEvent.COMBAT);
    expect(mockAction.onCombat).toHaveBeenCalledTimes(1);

    emitSchemeEvent(schemeState, ESchemeEvent.EXTRAPOLATE);
    expect(mockAction.onExtrapolate).toHaveBeenCalledTimes(1);

    emitSchemeEvent(schemeState, ESchemeEvent.SWITCH_OFFLINE);
    expect(mockAction.onSwitchOffline).toHaveBeenCalledTimes(1);

    emitSchemeEvent(schemeState, ESchemeEvent.SWITCH_ONLINE);
    expect(mockAction.onSwitchOnline).toHaveBeenCalledTimes(1);

    emitSchemeEvent(schemeState, ESchemeEvent.HIT);
    expect(mockAction.onHit).toHaveBeenCalledTimes(1);

    emitSchemeEvent(schemeState, ESchemeEvent.SAVE);
    expect(mockAction.save).toHaveBeenCalledTimes(1);

    emitSchemeEvent(schemeState, ESchemeEvent.UPDATE);
    expect(mockAction.update).toHaveBeenCalledTimes(1);

    emitSchemeEvent(schemeState, ESchemeEvent.USE);
    expect(mockAction.onUse).toHaveBeenCalledTimes(1);

    emitSchemeEvent(schemeState, ESchemeEvent.WAYPOINT);
    expect(mockAction.onWaypoint).toHaveBeenCalledTimes(1);
  });
});

describe("setObjectActiveSchemeSignal util", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should correctly set signals", () => {
    const object: GameObject = MockGameObject.mock();

    expect(() => setObjectActiveSchemeSignal(object, "test")).not.toThrow();
    expect(registry.objects.get(object.id())).toBeNull();

    const mockMeetState: IBaseSchemeState = mockSchemeState(EScheme.MEET, { signals: new LuaTable() });
    const state: IRegistryObjectState = registerObject(object);

    expect(() => setObjectActiveSchemeSignal(object, "test")).not.toThrow();
    expect(state).toEqual({ object });

    state[EScheme.MEET] = mockMeetState;
    setObjectActiveSchemeSignal(object, "test");
    expect(state[EScheme.MEET]?.signals).toEqualLuaTables({});

    state.activeScheme = EScheme.MEET;
    setObjectActiveSchemeSignal(object, "test");
    setObjectActiveSchemeSignal(object, "another");
    expect(state[EScheme.MEET]?.signals).toEqualLuaTables({ test: true, another: true });
  });
});
