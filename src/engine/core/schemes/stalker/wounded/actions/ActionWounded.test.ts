import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { object as object_actions, time_global } from "xray16";
import { GameObject } from "xray16/alias";
import { TRUE } from "xray16/lib";
import { MockGameObject, MockPropertyStorage } from "xray16/mocks";
import { replaceFunctionMockOnce } from "xray16/testing/utils";

import { StalkerStateController } from "@/engine/core/ai/state";
import {
  getManager,
  getPortableStoreValue,
  IRegistryObjectState,
  registerObject,
  registerSimulator,
  registry,
  setPortableStoreValue,
} from "@/engine/core/database";
import { registerWoundedObject } from "@/engine/core/database/wounded";
import { SoundManager } from "@/engine/core/managers/sounds";
import {
  ISchemeWoundedState,
  PS_BEGIN_WOUNDED,
  PS_WOUNDED_SOUND,
  PS_WOUNDED_STATE,
} from "@/engine/core/schemes/stalker/wounded";
import { ActionWounded } from "@/engine/core/schemes/stalker/wounded/actions/ActionWounded";
import { WoundController } from "@/engine/core/schemes/stalker/wounded/WoundController";
import { EScheme } from "@/engine/core/schemes/types";
import { mockSchemeState, resetRegistry } from "@/fixtures/engine";

describe("ActionWounded", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
  });

  it("should correctly initialize being wounded", () => {
    const object: GameObject = MockGameObject.mock();
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

    // Weapon is settled before laying animation starts and cannot be re-selected while wounded.
    expect(object.set_item).toHaveBeenCalledWith(object_actions.idle, null);
    expect(object.can_select_weapon).toHaveBeenCalledWith(false);

    expect(registry.objectsWounded.get(object.id())).toBe(state);
  });

  it("should correctly finalize and clean up the state", () => {
    const object: GameObject = MockGameObject.mock();
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

    // Weapon selection is restored from active logics configuration.
    expect(object.can_select_weapon).toHaveBeenCalledWith(true);
    expect(registry.objectsWounded.get(object.id())).toBeNil();
  });

  it("should correctly execute being wounded and hit object when state is true", () => {
    const object: GameObject = MockGameObject.mock();
    const schemeState: ISchemeWoundedState = mockSchemeState<ISchemeWoundedState>(EScheme.WOUNDED, {
      helpStartDialog: "test_dialog",
    });

    registerObject(object);

    const action: ActionWounded = new ActionWounded(schemeState);

    replaceFunctionMockOnce(time_global, () => 1000);

    action.nextSoundPlayAt = Infinity;

    setPortableStoreValue(object.id(), PS_WOUNDED_STATE, TRUE);

    action.setup(object, MockPropertyStorage.mock());
    action.execute();

    expect(object.hit).toHaveBeenCalled();
  });

  it("should correctly execute being wounded and hit object when state is true", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);
    const schemeState: ISchemeWoundedState = mockSchemeState<ISchemeWoundedState>(EScheme.WOUNDED, {
      helpStartDialog: "test_dialog",
      woundController: { useMedkit: jest.fn() } as unknown as WoundController,
    });

    const soundManager: SoundManager = getManager(SoundManager);
    const action: ActionWounded = new ActionWounded(schemeState);

    state.stateController = { setState: jest.fn() } as unknown as StalkerStateController;

    schemeState.canUseMedkit = true;

    jest.spyOn(soundManager, "play").mockImplementation(() => null);
    replaceFunctionMockOnce(time_global, () => 1000);

    action.nextSoundPlayAt = 0;

    setPortableStoreValue(object.id(), PS_WOUNDED_STATE, "test");
    setPortableStoreValue(object.id(), PS_WOUNDED_SOUND, "test_snd");

    action.setup(object, MockPropertyStorage.mock());
    action.execute();

    expect(object.hit).not.toHaveBeenCalled();
    expect(soundManager.play).toHaveBeenCalledWith(object.id(), "test_snd");
    expect(action.nextSoundPlayAt).toBe(6000);
    expect(schemeState.woundController.useMedkit).toHaveBeenCalled();
    expect(state.stateController.setState).toHaveBeenCalled();
  });

  it("should correctly execute being wounded and autoheal", () => {
    const object: GameObject = MockGameObject.mock();
    const schemeState: ISchemeWoundedState = mockSchemeState<ISchemeWoundedState>(EScheme.WOUNDED, {
      helpStartDialog: "test_dialog",
      woundController: { unlockMedkit: jest.fn() } as unknown as WoundController,
    });

    registerObject(object);

    const action: ActionWounded = new ActionWounded(schemeState);

    schemeState.isAutoHealing = true;
    replaceFunctionMockOnce(time_global, () => 1000);

    action.nextSoundPlayAt = Infinity;

    setPortableStoreValue(object.id(), PS_WOUNDED_STATE, TRUE);

    action.setup(object, MockPropertyStorage.mock());
    action.execute();

    expect(registry.simulator.create).not.toHaveBeenCalled();
    expect(getPortableStoreValue(object.id(), PS_BEGIN_WOUNDED)).toBe(1000);
    expect(schemeState.woundController.unlockMedkit).not.toHaveBeenCalled();

    replaceFunctionMockOnce(time_global, () => 100_000);
    action.execute();

    expect(registry.simulator.create).toHaveBeenCalled();
    expect(getPortableStoreValue(object.id(), PS_BEGIN_WOUNDED)).toBe(1000);
    expect(schemeState.woundController.unlockMedkit).toHaveBeenCalled();
  });
});
