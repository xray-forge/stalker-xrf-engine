import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { AnyCallablesModule, getExtern } from "xray16/lib";
import { $fromArray } from "xray16/macros";
import { MockGameObject } from "xray16/mocks";

import { IRegistryObjectState, registerObject, registerStoryLink } from "@/engine/core/database";
import { resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/object/update_npc_logic");
});

beforeEach(() => {
  resetRegistry();
});

describe("update_npc_logic", () => {
  it("should update every resolved stalker planner and state controller", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);
    const stateController = { update: jest.fn() };

    registerStoryLink(object.id(), "stalker");
    state.stateController = stateController as never;
    jest.spyOn(object.motivation_action_manager(), "update");

    getExtern<AnyCallablesModule>("xr_effects").update_npc_logic(
      MockGameObject.mockActor(),
      MockGameObject.mock(),
      $fromArray(["stalker", "unknown"])
    );

    expect(object.motivation_action_manager().update).toHaveBeenCalledTimes(3);
    expect(stateController.update).toHaveBeenCalledTimes(7);
  });
});
