import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { time_global } from "xray16";

import { StalkerStateManager } from "@/engine/core/ai/state";
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
import { WoundManager } from "@/engine/core/schemes/stalker/wounded/WoundManager";
import { TRUE } from "@/engine/lib/constants/words";
import { EScheme, GameObject } from "@/engine/lib/types";
import { mockSchemeState, resetRegistry } from "@/fixtures/engine";
import { replaceFunctionMockOnce } from "@/fixtures/jest";
import { MockGameObject, MockPropertyStorage } from "@/fixtures/xray";

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

    expect(registry.objectsWounded.get(object.id())).toBeNull();
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
      woundManager: { useMedkit: jest.fn() } as unknown as WoundManager,
    });

    const soundManager: SoundManager = getManager(SoundManager);
    const action: ActionWounded = new ActionWounded(schemeState);

    state.stateManager = { setState: jest.fn() } as unknown as StalkerStateManager;

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
    expect(schemeState.woundManager.useMedkit).toHaveBeenCalled();
    expect(state.stateManager.setState).toHaveBeenCalled();
  });

  it("should correctly execute being wounded and autoheal", () => {
    const object: GameObject = MockGameObject.mock();
    const schemeState: ISchemeWoundedState = mockSchemeState<ISchemeWoundedState>(EScheme.WOUNDED, {
      helpStartDialog: "test_dialog",
      woundManager: { unlockMedkit: jest.fn() } as unknown as WoundManager,
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
    expect(schemeState.woundManager.unlockMedkit).not.toHaveBeenCalled();

    replaceFunctionMockOnce(time_global, () => 100_000);
    action.execute();

    expect(registry.simulator.create).toHaveBeenCalled();
    expect(getPortableStoreValue(object.id(), PS_BEGIN_WOUNDED)).toBe(1000);
    expect(schemeState.woundManager.unlockMedkit).toHaveBeenCalled();
  });
});
