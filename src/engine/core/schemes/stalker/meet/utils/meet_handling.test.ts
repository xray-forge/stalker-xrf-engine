import { describe, expect, it, jest } from "@jest/globals";

import { IRegistryObjectState, registerObject } from "@/engine/core/database";
import {
  addObjectAbuse,
  clearObjectAbuse,
  setObjectAbuseState,
} from "@/engine/core/schemes/stalker/meet/utils/meet_handling";
import { AnyObject, ClientObject, EScheme } from "@/engine/lib/types";
import { mockSchemeState } from "@/fixtures/engine";
import { mockClientGameObject } from "@/fixtures/xray";

describe("meet handling utils", () => {
  it("addObjectAbuse should correctly add abuse values to the manager", () => {
    const object: ClientObject = mockClientGameObject();
    const state: IRegistryObjectState = registerObject(object);
    const manager = { addAbuse: jest.fn() };

    state[EScheme.ABUSE] = mockSchemeState(EScheme.ABUSE, {
      abuseManager: manager,
    } as AnyObject);

    addObjectAbuse(object, 10);
    expect(manager.addAbuse).toHaveBeenCalledWith(10);

    addObjectAbuse(object, 20);
    expect(manager.addAbuse).toHaveBeenCalledTimes(2);
  });

  it("clearObjectAbuse should correctly clear abuse state from the manager", () => {
    const object: ClientObject = mockClientGameObject();
    const state: IRegistryObjectState = registerObject(object);
    const manager = { clearAbuse: jest.fn() };

    state[EScheme.ABUSE] = mockSchemeState(EScheme.ABUSE, {
      abuseManager: manager,
    } as AnyObject);

    clearObjectAbuse(object);
    expect(manager.clearAbuse).toHaveBeenCalled();

    clearObjectAbuse(object);
    expect(manager.clearAbuse).toHaveBeenCalledTimes(2);
  });

  it("setObjectAbuseState should correctly set abuse state for the manager", () => {
    const object: ClientObject = mockClientGameObject();
    const state: IRegistryObjectState = registerObject(object);
    const manager = { enableAbuse: jest.fn(), disableAbuse: jest.fn() };

    state[EScheme.ABUSE] = mockSchemeState(EScheme.ABUSE, {
      abuseManager: manager,
    } as AnyObject);

    setObjectAbuseState(object, true);
    expect(manager.enableAbuse).toHaveBeenCalledTimes(1);

    setObjectAbuseState(object, false);
    expect(manager.disableAbuse).toHaveBeenCalledTimes(1);
  });
});
