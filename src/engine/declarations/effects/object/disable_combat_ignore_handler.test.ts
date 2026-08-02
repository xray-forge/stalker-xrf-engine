import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { IRegistryObjectState, registerObject } from "@/engine/core/database";
import { ISchemeCombatIgnoreState } from "@/engine/core/schemes/stalker/combat_ignore";
import { getSchemeState, setSchemeState } from "@/engine/core/schemes/state";
import { EScheme } from "@/engine/core/schemes/types";
import { callXrEffect, mockSchemeState, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/object/disable_combat_ignore_handler");
});

beforeEach(() => {
  resetRegistry();
});

describe("disable_combat_ignore_handler", () => {
  it("should disable combat ignore state", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);

    setSchemeState(
      state,
      EScheme.COMBAT_IGNORE,
      mockSchemeState<ISchemeCombatIgnoreState>(EScheme.COMBAT_IGNORE, { enabled: true })
    );

    callXrEffect("disable_combat_ignore_handler", MockGameObject.mockActor(), object);

    expect(getSchemeState(state, EScheme.COMBAT_IGNORE)?.enabled).toBe(false);
  });

  it("should do nothing when the combat ignore scheme is absent", () => {
    const object: GameObject = MockGameObject.mock();

    registerObject(object);

    expect(() => callXrEffect("disable_combat_ignore_handler", MockGameObject.mockActor(), object)).not.toThrow();
  });
});
