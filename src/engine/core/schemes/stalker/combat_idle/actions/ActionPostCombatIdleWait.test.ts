import { describe, expect, it, jest } from "@jest/globals";
import { anim, look, move } from "xray16";

import { StalkerAnimationManager } from "@/engine/core/ai/state/StalkerAnimationManager";
import { EStalkerState } from "@/engine/core/animation/types";
import { getManager } from "@/engine/core/database";
import { SoundManager } from "@/engine/core/managers/sounds";
import { ISchemePostCombatIdleState } from "@/engine/core/schemes/stalker/combat_idle";
import { ActionPostCombatIdleWait } from "@/engine/core/schemes/stalker/combat_idle/actions/ActionPostCombatIdleWait";
import { isObjectWeaponLocked, setObjectBestWeapon } from "@/engine/core/utils/weapon";
import { EScheme, GameObject } from "@/engine/lib/types";
import { mockSchemeState } from "@/fixtures/engine";
import { replaceFunctionMockOnce } from "@/fixtures/jest";
import { MockGameObject, MockPropertyStorage } from "@/fixtures/xray";

jest.mock("@/engine/core/utils/weapon");

function mockAction(
  state: ISchemePostCombatIdleState = mockSchemeState(EScheme.POST_COMBAT_IDLE, {
    lastBestEnemyId: null,
    lastBestEnemyName: null,
  } as ISchemePostCombatIdleState)
): ActionPostCombatIdleWait {
  const action: ActionPostCombatIdleWait = new ActionPostCombatIdleWait(state);
  const object: GameObject = MockGameObject.mock();

  action.setup(object, MockPropertyStorage.mock());

  return action;
}

describe("ActionPostCombatIdleWait", () => {
  it("should correctly initialize", () => {
    const action: ActionPostCombatIdleWait = mockAction();

    action.initialize();

    expect(setObjectBestWeapon).toHaveBeenCalledWith(action.object);
    expect(action.object.set_mental_state).toHaveBeenCalledWith(anim.danger);
    expect(action.object.set_body_state).toHaveBeenCalledWith(move.crouch);
    expect(action.object.set_movement_type).toHaveBeenCalledWith(move.stand);
    expect(action.object.set_sight).toHaveBeenCalledWith(look.danger, null, 0);

    expect(action.isAnimationStarted).toBe(false);
    expect(action.stateManager).toEqual({ animstate: { state: { animationMarker: null } } });
    expect(action.state.animation).toBeInstanceOf(StalkerAnimationManager);
  });

  it("should correctly finalize", () => {
    const soundManager: SoundManager = getManager(SoundManager);
    const action: ActionPostCombatIdleWait = mockAction();

    jest.spyOn(soundManager, "play").mockImplementation(jest.fn(() => null));

    action.initialize();

    const animation: StalkerAnimationManager = action.state.animation as StalkerAnimationManager;

    jest.spyOn(animation, "setState").mockImplementation(jest.fn());

    action.isAnimationStarted = true;

    action.finalize();

    expect(soundManager.play).toHaveBeenCalledWith(action.object.id(), "post_combat_relax");
    expect(action.state.animation).toBeNull();
    expect(animation.setState).toHaveBeenCalledWith(null, true);
  });

  it("should correctly execute", () => {
    const soundManager: SoundManager = getManager(SoundManager);
    const action: ActionPostCombatIdleWait = mockAction();

    jest.spyOn(soundManager, "play").mockImplementation(jest.fn(() => null));

    action.initialize();

    const animation: StalkerAnimationManager = action.state.animation as StalkerAnimationManager;

    jest.spyOn(animation, "setState").mockImplementation(jest.fn());
    jest.spyOn(animation, "setControl").mockImplementation(jest.fn());

    action.execute();

    expect(action.isAnimationStarted).toBe(true);
    expect(animation.setState).toHaveBeenCalledWith(EStalkerState.HIDE);
    expect(animation.setControl).toHaveBeenCalled();
    expect(soundManager.play).toHaveBeenCalledWith(action.object.id(), "post_combat_wait");
  });

  it("should correctly skip animation states based on conditions", () => {
    const soundManager: SoundManager = getManager(SoundManager);
    const action: ActionPostCombatIdleWait = mockAction();

    jest.spyOn(soundManager, "play").mockImplementation(jest.fn(() => null));

    action.initialize();

    const animation: StalkerAnimationManager = action.state.animation as StalkerAnimationManager;

    jest.spyOn(animation, "setState").mockImplementation(jest.fn());
    jest.spyOn(animation, "setControl").mockImplementation(jest.fn());

    action.isAnimationStarted = true;

    action.execute();

    expect(soundManager.play).not.toHaveBeenCalled();

    action.isAnimationStarted = false;
    jest.spyOn(action.object, "in_smart_cover").mockImplementation(() => true);

    action.execute();

    expect(soundManager.play).not.toHaveBeenCalled();

    jest.spyOn(action.object, "in_smart_cover").mockImplementation(() => false);
    replaceFunctionMockOnce(isObjectWeaponLocked, () => true);

    action.execute();

    expect(soundManager.play).not.toHaveBeenCalled();
  });
});
