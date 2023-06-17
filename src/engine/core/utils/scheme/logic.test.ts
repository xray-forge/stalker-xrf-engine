import { describe, expect, it, jest } from "@jest/globals";

import {
  IRegistryObjectState,
  IStoredOfflineObject,
  registerActor,
  registerObject,
  registerOfflineObject,
  registry,
} from "@/engine/core/database";
import { ESchemeEvent, IBaseSchemeState } from "@/engine/core/schemes";
import { disableInfo, giveInfo } from "@/engine/core/utils/info_portion";
import { emitSchemeEvent, getSectionToActivate, isSectionActive } from "@/engine/core/utils/scheme/logic";
import { NIL } from "@/engine/lib/constants/words";
import { ClientObject, EScheme, IniFile } from "@/engine/lib/types";
import { mockSchemeState } from "@/fixtures/engine/mocks";
import { mockClientGameObject, mockIniFile } from "@/fixtures/xray";

describe("'scheme logic' utils", () => {
  it("'isSectionActive' should correctly check scheme activity", () => {
    const object: ClientObject = mockClientGameObject();
    const state: IRegistryObjectState = registerObject(object);

    state.active_section = "sr_idle@test";

    expect(isSectionActive(object, mockSchemeState(object, EScheme.SR_TELEPORT, { section: "sr_teleport@test" }))).toBe(
      false
    );
    expect(isSectionActive(object, mockSchemeState(object, EScheme.SR_TELEPORT, { section: "sr_idle@test" }))).toBe(
      true
    );

    state.active_section = "sr_teleport@test";

    expect(isSectionActive(object, mockSchemeState(object, EScheme.SR_TELEPORT, { section: "sr_teleport@test" }))).toBe(
      true
    );
    expect(isSectionActive(object, mockSchemeState(object, EScheme.SR_TELEPORT, { section: "sr_idle@test" }))).toBe(
      false
    );
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

  it("'getSectionToActivate' should correctly determine active section", () => {
    const actor: ClientObject = mockClientGameObject();
    const object: ClientObject = mockClientGameObject();

    const ini: IniFile = mockIniFile("test.ltx", {
      "sr_idle@empty": {},
      "sr_idle@fallback": {},
      "sr_idle@previous": {},
      "sr_idle@bad": {
        active: "{+test_condition} sr_idle@desired",
      },
      "sr_idle@desired": {
        active: "{+test_condition} sr_idle@desired, sr_idle@fallback",
      },
    });

    registerActor(actor);

    expect(getSectionToActivate(object, ini, "sr_idle@not_existing")).toBe(NIL);
    expect(getSectionToActivate(object, ini, "sr_idle@empty")).toBe(NIL);
    expect(getSectionToActivate(object, ini, "sr_idle@desired")).toBe("sr_idle@fallback");

    expect(() => getSectionToActivate(object, ini, "sr_idle@bad")).toThrow();

    giveInfo("test_condition");
    expect(getSectionToActivate(object, ini, "sr_idle@desired")).toBe("sr_idle@desired");

    disableInfo("test_condition");
    expect(getSectionToActivate(object, ini, "sr_idle@desired")).toBe("sr_idle@fallback");

    const offlineState: IStoredOfflineObject = registerOfflineObject(object.id(), {
      activeSection: "sr_idle@not_existing",
      levelVertexId: 123,
    });

    expect(getSectionToActivate(object, ini, "sr_idle@desired")).toBe("sr_idle@fallback");

    offlineState.activeSection = "sr_idle@previous";

    expect(getSectionToActivate(object, ini, "sr_idle@desired")).toBe("sr_idle@previous");

    expect(registry.offlineObjects.get(object.id()).activeSection).toBeNull();
  });
});
