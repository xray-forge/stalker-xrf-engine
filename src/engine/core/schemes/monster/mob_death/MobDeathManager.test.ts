import { describe, expect, it } from "@jest/globals";

import { IRegistryObjectState, registerObject } from "@/engine/core/database";
import { ISchemeMobDeathState } from "@/engine/core/schemes/monster/mob_death/ISchemeMobDeathState";
import { MobDeathManager } from "@/engine/core/schemes/monster/mob_death/MobDeathManager";
import { ClientObject, EScheme } from "@/engine/lib/types";
import { mockSchemeState } from "@/fixtures/engine";
import { mockClientGameObject } from "@/fixtures/xray";

describe("MobDeathManager", () => {
  it("should correctly handle death without killer", () => {
    const object: ClientObject = mockClientGameObject();
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
    const object: ClientObject = mockClientGameObject();
    const state: IRegistryObjectState = registerObject(object);
    const schemeState: ISchemeMobDeathState = mockSchemeState<ISchemeMobDeathState>(EScheme.MOB_HOME);
    const manager: MobDeathManager = new MobDeathManager(object, schemeState);

    const killer: ClientObject = mockClientGameObject();

    manager.onDeath(object, killer);

    expect(state[EScheme.DEATH]).toEqual({
      killerId: killer.id(),
      killerName: killer.name(),
    });
  });
});
