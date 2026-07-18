import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";
import { resetFunctionMock } from "xray16/testing/utils";

import { IRegistryObjectState, registerObject } from "@/engine/core/database";
import { ISchemeMobDeathState } from "@/engine/core/schemes/monster/mob_death/mob_death_types";
import { MobDeathManager } from "@/engine/core/schemes/monster/mob_death/MobDeathManager";
import { trySwitchToAnotherSection } from "@/engine/core/schemes/runtime";
import { getSchemeStateOptimistic } from "@/engine/core/schemes/state";
import { EScheme } from "@/engine/lib/types";
import { mockSchemeState, resetRegistry } from "@/fixtures/engine";

jest.mock("@/engine/core/schemes/runtime/scheme_switch");

describe("MobDeathManager", () => {
  beforeEach(() => {
    resetRegistry();
    resetFunctionMock(trySwitchToAnotherSection);
  });

  it("should correctly handle death without killer", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);
    const schemeState: ISchemeMobDeathState = mockSchemeState<ISchemeMobDeathState>(EScheme.MOB_HOME);
    const manager: MobDeathManager = new MobDeathManager(object, schemeState);

    manager.onDeath(object, null);

    expect(getSchemeStateOptimistic(state, EScheme.DEATH)).toEqual({
      killerId: -1,
    });

    expect(trySwitchToAnotherSection).toHaveBeenCalledTimes(1);
  });

  it("should correctly handle death with killer", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);
    const schemeState: ISchemeMobDeathState = mockSchemeState<ISchemeMobDeathState>(EScheme.MOB_HOME);
    const manager: MobDeathManager = new MobDeathManager(object, schemeState);

    const killer: GameObject = MockGameObject.mock();

    manager.onDeath(object, killer);

    expect(getSchemeStateOptimistic(state, EScheme.DEATH)).toEqual({
      killerId: killer.id(),
    });

    expect(trySwitchToAnotherSection).toHaveBeenCalledTimes(1);
  });
});
