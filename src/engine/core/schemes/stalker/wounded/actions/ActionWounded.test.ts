import { describe, expect, it } from "@jest/globals";
import { time_global } from "xray16";

import { IRegistryObjectState, registerObject, registerWoundedObject, registry } from "@/engine/core/database";
import { ISchemeWoundedState } from "@/engine/core/schemes/stalker/wounded";
import { ActionWounded } from "@/engine/core/schemes/stalker/wounded/actions/ActionWounded";
import { ClientObject, EScheme } from "@/engine/lib/types";
import { mockSchemeState } from "@/fixtures/engine";
import { replaceFunctionMockOnce } from "@/fixtures/jest";
import { mockClientGameObject, MockPropertyStorage } from "@/fixtures/xray";

describe("ActionWounded class", () => {
  it("should correctly initialize being wounded", () => {
    const object: ClientObject = mockClientGameObject();
    const state: IRegistryObjectState = registerObject(object);
    const schemeState: ISchemeWoundedState = mockSchemeState<ISchemeWoundedState>(EScheme.WOUNDED, {
      helpStartDialog: "test_dialog",
    });

    const action: ActionWounded = new ActionWounded(schemeState);

    replaceFunctionMockOnce(time_global, () => 1000);

    expect(action.nextSoundPlayAt).toBe(0);
    expect(action.state).toBe(schemeState);

    action.setup(object, MockPropertyStorage.mock());
    action.initialize();

    expect(object.set_desired_direction).toHaveBeenCalledTimes(1);
    expect(object.set_desired_direction).toHaveBeenCalledTimes(1);
    expect(object.set_start_dialog).toHaveBeenCalledWith("test_dialog");
    expect(object.movement_enabled).toHaveBeenCalledWith(false);
    expect(object.disable_trade).toHaveBeenCalledWith();
    expect(object.wounded).toHaveBeenCalledWith(true);
    expect(action.nextSoundPlayAt).toBe(6000);

    expect(registry.objectsWounded.get(object.id())).toBe(state);
  });

  it("should correctly finalize and clean up the state", () => {
    const object: ClientObject = mockClientGameObject();
    const state: IRegistryObjectState = registerObject(object);
    const schemeState: ISchemeWoundedState = mockSchemeState<ISchemeWoundedState>(EScheme.WOUNDED, {
      helpStartDialog: "test_dialog",
    });

    const action: ActionWounded = new ActionWounded(schemeState);

    registerWoundedObject(object);

    expect(registry.objectsWounded.get(object.id())).toBe(state);

    action.setup(object, MockPropertyStorage.mock());
    action.finalize();

    expect(object.enable_trade).toHaveBeenCalledWith();
    expect(object.disable_talk).toHaveBeenCalledWith();
    expect(object.wounded).toHaveBeenCalledWith(false);
    expect(object.movement_enabled).toHaveBeenCalledWith(true);

    expect(registry.objectsWounded.get(object.id())).toBeNull();
  });

  it.todo("should correctly execute being wounded");
});
