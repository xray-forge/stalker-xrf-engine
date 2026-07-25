import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject, MockPropertyStorage } from "xray16/mocks";
import { resetFunctionMock } from "xray16/testing/utils";

import { EStalkerState } from "@/engine/core/animation/types";
import { registerObject, setStalkerState } from "@/engine/core/database";
import { ISchemeCombatState } from "@/engine/core/schemes/stalker/combat/combat_types";
import { ActionShoot } from "@/engine/core/schemes/stalker/combat_camper/actions/ActionShoot";
import { EScheme } from "@/engine/core/schemes/types";
import { mockSchemeState, resetRegistry } from "@/fixtures/engine";

jest.mock("@/engine/core/database/stalker", () => ({ setStalkerState: jest.fn() }));

function createAction(): { action: ActionShoot; object: GameObject; state: ISchemeCombatState } {
  const object: GameObject = MockGameObject.mock();
  const state: ISchemeCombatState = mockSchemeState<ISchemeCombatState>(EScheme.COMBAT, {
    isCamperCombatAction: null,
  });
  const action: ActionShoot = new ActionShoot(state);

  registerObject(object);
  action.setup(object, MockPropertyStorage.mock());

  return { action, object, state };
}

describe("ActionShoot", () => {
  beforeEach(() => {
    resetRegistry();
    resetFunctionMock(setStalkerState);
  });

  it("should start hide-fire state looking at best enemy", () => {
    const { action, object, state } = createAction();
    const enemy: GameObject = MockGameObject.mock();

    jest.spyOn(object, "best_enemy").mockImplementation(() => enemy);

    action.initialize();

    expect(setStalkerState).toHaveBeenCalledWith(object, EStalkerState.HIDE_FIRE, null, null, {
      lookObjectId: enemy.id(),
      lookPosition: null,
    });
    expect(state.isCamperCombatAction).toBe(true);
  });

  it("should start hide-fire state without enemy", () => {
    const { action, object } = createAction();

    action.initialize();

    expect(setStalkerState).toHaveBeenCalledWith(object, EStalkerState.HIDE_FIRE, null, null, {
      lookObjectId: undefined,
      lookPosition: null,
    });
  });

  it("should reset camper combat flag on finalize", () => {
    const { action, state } = createAction();

    action.initialize();
    action.finalize();

    expect(state.isCamperCombatAction).toBe(false);
  });
});
