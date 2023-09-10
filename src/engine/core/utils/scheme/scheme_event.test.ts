import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { registry } from "@/engine/core/database";
import { ESchemeEvent, IBaseSchemeState } from "@/engine/core/objects/ai/scheme";
import { emitSchemeEvent } from "@/engine/core/utils/scheme/scheme_event";
import { ClientObject, EScheme } from "@/engine/lib/types";
import { mockSchemeState } from "@/fixtures/engine/mocks";
import { mockClientGameObject } from "@/fixtures/xray";

describe("'scheme logic' utils", () => {
  beforeEach(() => {
    registry.schemes = new LuaTable();
    registry.actor = null as unknown as ClientObject;
  });

  it("'emitSchemeEvent' should correctly emit events", () => {
    const object: ClientObject = mockClientGameObject();
    const schemeState: IBaseSchemeState = mockSchemeState(object, EScheme.MEET);
    const mockAction = {
      activateScheme: jest.fn(),
      deactivate: jest.fn(),
      onDeath: jest.fn(),
      onCutscene: jest.fn(),
      onExtrapolate: jest.fn(),
      net_destroy: jest.fn(),
      onHit: jest.fn(),
      resetScheme: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      onUse: jest.fn(),
      onWaypoint: jest.fn(),
    };

    expect(() => emitSchemeEvent(object, schemeState, ESchemeEvent.ACTIVATE_SCHEME)).not.toThrow();

    schemeState.actions = new LuaTable();
    expect(() => emitSchemeEvent(object, schemeState, ESchemeEvent.ACTIVATE_SCHEME)).not.toThrow();

    schemeState.actions.set(mockAction, true);

    emitSchemeEvent(object, schemeState, ESchemeEvent.ACTIVATE_SCHEME, object, 1, 2, 3);
    expect(mockAction.activateScheme).toHaveBeenCalledWith(object, 1, 2, 3);

    emitSchemeEvent(object, schemeState, ESchemeEvent.DEACTIVATE);
    expect(mockAction.deactivate).toHaveBeenCalledTimes(1);

    emitSchemeEvent(object, schemeState, ESchemeEvent.DEATH);
    expect(mockAction.onDeath).toHaveBeenCalledTimes(1);

    emitSchemeEvent(object, schemeState, ESchemeEvent.CUTSCENE);
    expect(mockAction.onCutscene).toHaveBeenCalledTimes(1);

    emitSchemeEvent(object, schemeState, ESchemeEvent.EXTRAPOLATE);
    expect(mockAction.onExtrapolate).toHaveBeenCalledTimes(1);

    emitSchemeEvent(object, schemeState, ESchemeEvent.NET_DESTROY);
    expect(mockAction.net_destroy).toHaveBeenCalledTimes(1);

    emitSchemeEvent(object, schemeState, ESchemeEvent.HIT);
    expect(mockAction.onHit).toHaveBeenCalledTimes(1);

    emitSchemeEvent(object, schemeState, ESchemeEvent.RESET_SCHEME);
    expect(mockAction.resetScheme).toHaveBeenCalledTimes(1);

    emitSchemeEvent(object, schemeState, ESchemeEvent.SAVE);
    expect(mockAction.save).toHaveBeenCalledTimes(1);

    emitSchemeEvent(object, schemeState, ESchemeEvent.UPDATE);
    expect(mockAction.update).toHaveBeenCalledTimes(1);

    emitSchemeEvent(object, schemeState, ESchemeEvent.USE);
    expect(mockAction.onUse).toHaveBeenCalledTimes(1);

    emitSchemeEvent(object, schemeState, ESchemeEvent.WAYPOINT);
    expect(mockAction.onWaypoint).toHaveBeenCalledTimes(1);
  });
});
