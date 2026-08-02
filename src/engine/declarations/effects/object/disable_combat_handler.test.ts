import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { registerObject } from "@/engine/core/database";
import { ISchemeMobCombatState } from "@/engine/core/schemes/monster/mob_combat";
import { ISchemeCombatState } from "@/engine/core/schemes/stalker/combat";
import { getSchemeState, setSchemeState } from "@/engine/core/schemes/state";
import { EScheme } from "@/engine/core/schemes/types";
import { callXrEffect, mockSchemeState, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/object/disable_combat_handler");
});

beforeEach(() => {
  resetRegistry();
});

describe("disable_combat_handler", () => {
  it("should disable every registered combat handler", () => {
    const object: GameObject = MockGameObject.mock();
    const state = registerObject(object);

    setSchemeState(state, EScheme.COMBAT, mockSchemeState<ISchemeCombatState>(EScheme.COMBAT, { enabled: true }));
    setSchemeState(
      state,
      EScheme.MOB_COMBAT,
      mockSchemeState<ISchemeMobCombatState>(EScheme.MOB_COMBAT, { enabled: true })
    );

    callXrEffect("disable_combat_handler", MockGameObject.mockActor(), object);

    expect(getSchemeState(state, EScheme.COMBAT)?.enabled).toBe(false);
    expect(getSchemeState(state, EScheme.MOB_COMBAT)?.enabled).toBe(false);
  });

  it("should do nothing when neither combat scheme is present", () => {
    const object: GameObject = MockGameObject.mock();

    registerObject(object);

    expect(() => callXrEffect("disable_combat_handler", MockGameObject.mockActor(), object)).not.toThrow();
  });
});
