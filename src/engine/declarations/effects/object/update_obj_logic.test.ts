import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { AnyCallablesModule, getExtern } from "xray16/lib";
import { $fromArray } from "xray16/macros";
import { MockGameObject } from "xray16/mocks";

import { IRegistryObjectState, registerObject, registerStoryLink } from "@/engine/core/database";
import { trySwitchToAnotherSection } from "@/engine/core/schemes/runtime";
import { ISchemeCombatState } from "@/engine/core/schemes/stalker/combat";
import { setSchemeState } from "@/engine/core/schemes/state";
import { EScheme } from "@/engine/core/schemes/types";
import { callXrEffect, mockSchemeState, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/object/update_obj_logic");
});

jest.mock("@/engine/core/schemes/runtime/scheme_switch", () => {
  const actual = jest.requireActual<Record<string, unknown>>("@/engine/core/schemes/runtime/scheme_switch");

  return { ...actual, trySwitchToAnotherSection: jest.fn() };
});

beforeEach(() => {
  resetRegistry();
});

describe("update_obj_logic", () => {
  it("should re-evaluate the active scheme of every resolved story object", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);
    const activeState = mockSchemeState<ISchemeCombatState>(EScheme.COMBAT);

    state.activeScheme = EScheme.COMBAT;
    setSchemeState(state, EScheme.COMBAT, activeState);
    registerStoryLink(object.id(), "target");

    getExtern<AnyCallablesModule>("xr_effects").update_obj_logic(
      MockGameObject.mockActor(),
      MockGameObject.mock(),
      $fromArray(["target", "missing"])
    );

    expect(trySwitchToAnotherSection).toHaveBeenCalledTimes(1);
    expect(trySwitchToAnotherSection).toHaveBeenCalledWith(object, activeState);
  });

  it("should skip story ids that resolve to nothing", () => {
    expect(() =>
      callXrEffect("update_obj_logic", MockGameObject.mockActor(), MockGameObject.mock(), "missing-logic-object")
    ).not.toThrow();
  });
});
