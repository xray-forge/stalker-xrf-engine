import { describe, expect, it } from "@jest/globals";

import { IRegistryObjectState, registerObject } from "@/engine/core/database";
import { ISchemeMobDeathState } from "@/engine/core/schemes/monster/mob_death/mob_death_types";
import { MobDeathManager } from "@/engine/core/schemes/monster/mob_death/MobDeathManager";
import { EScheme, GameObject } from "@/engine/lib/types";
import { mockSchemeState } from "@/fixtures/engine";
import { MockGameObject } from "@/fixtures/xray";

describe("MobDeathManager", () => {
  it("should correctly handle death without killer", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);
    const schemeState: ISchemeMobDeathState = mockSchemeState<ISchemeMobDeathState>(EScheme.MOB_HOME);
    const manager: MobDeathManager = new MobDeathManager(object, schemeState);

    manager.onDeath(object, null);

    expect(state[EScheme.DEATH]).toEqual({
      killerId: -1,
      killerName: null,
    });
  });

  it("should correctly handle death with killer", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);
    const schemeState: ISchemeMobDeathState = mockSchemeState<ISchemeMobDeathState>(EScheme.MOB_HOME);
    const manager: MobDeathManager = new MobDeathManager(object, schemeState);

    const killer: GameObject = MockGameObject.mock();

    manager.onDeath(object, killer);

    expect(state[EScheme.DEATH]).toEqual({
      killerId: killer.id(),
      killerName: killer.name(),
    });
  });
});
