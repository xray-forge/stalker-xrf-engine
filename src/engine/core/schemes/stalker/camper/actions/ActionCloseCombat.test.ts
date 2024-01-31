import { describe, expect, it } from "@jest/globals";

import { StalkerPatrolManager } from "@/engine/core/ai/patrol";
import { IRegistryObjectState, registerObject } from "@/engine/core/database";
import { ISchemeCamperState } from "@/engine/core/schemes/stalker/camper";
import { ActionCloseCombat } from "@/engine/core/schemes/stalker/camper/actions/ActionCloseCombat";
import { EScheme, GameObject } from "@/engine/lib/types";
import { mockSchemeState } from "@/fixtures/engine";
import { MockGameObject, MockPropertyStorage } from "@/fixtures/xray";

describe("ActionCloseCombat.test.ts class", () => {
  it("should correctly initialize", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);
    const schemeState: ISchemeCamperState = mockSchemeState(EScheme.COMBAT_CAMPER);

    state.patrolManager = new StalkerPatrolManager(object);

    const action: ActionCloseCombat = new ActionCloseCombat(schemeState, object);

    action.setup(object, MockPropertyStorage.mock());

    expect(action.state).toBe(schemeState);
    expect(action.patrolManager).toBe(state.patrolManager);
    expect(schemeState.scanTable).toEqualLuaTables({});
  });

  it.todo("should correctly destroy");

  it.todo("should correctly reset");

  it.todo("should correctly handle action execution");

  it.todo("should correctly check if can shoot");

  it.todo("should correctly process danger");

  it.todo("should correctly scan");
});
