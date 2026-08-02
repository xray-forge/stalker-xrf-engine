import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { EGameObjectRelation, GameObject, TRelationType } from "xray16/alias";
import { ACTOR_ID } from "xray16/lib";
import { MockGameObject } from "xray16/mocks";

import { IRegistryObjectState, registerObject } from "@/engine/core/database";
import { ISchemeDeathState } from "@/engine/core/schemes/stalker/death";
import { setSchemeState } from "@/engine/core/schemes/state";
import { EScheme } from "@/engine/core/schemes/types";
import { callXrCondition, mockSchemeState } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/conditions/relation/actor_enemy");
});

describe("actor_enemy", () => {
  it("should check if actor is enemy", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);

    jest.spyOn(object, "relation").mockImplementation(() => EGameObjectRelation.ENEMY as TRelationType);
    expect(callXrCondition("actor_enemy", MockGameObject.mockActor(), object)).toBe(true);

    jest.spyOn(object, "relation").mockImplementation(() => EGameObjectRelation.FRIEND as TRelationType);
    expect(callXrCondition("actor_enemy", MockGameObject.mockActor(), object)).toBe(false);

    setSchemeState(state, EScheme.DEATH, mockSchemeState<ISchemeDeathState>(EScheme.DEATH, { killerId: ACTOR_ID }));
    expect(callXrCondition("actor_enemy", MockGameObject.mockActor(), object)).toBe(true);
  });
});
