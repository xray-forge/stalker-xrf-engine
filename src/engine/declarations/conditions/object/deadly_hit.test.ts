import { beforeAll, describe, expect, it } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { IRegistryObjectState, registerObject } from "@/engine/core/database";
import { ISchemeHitState } from "@/engine/core/schemes/stalker/hit";
import { setSchemeState } from "@/engine/core/schemes/state";
import { EScheme } from "@/engine/core/schemes/types";
import { callXrCondition, mockSchemeState } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/conditions/object/deadly_hit");
});

describe("deadly_hit", () => {
  it("should check if hit is deadly", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);
    const schemeState: ISchemeHitState = mockSchemeState(EScheme.HIT);

    expect(callXrCondition("deadly_hit", MockGameObject.mockActor(), object)).toBe(false);

    setSchemeState(state, EScheme.HIT, schemeState);

    expect(callXrCondition("deadly_hit", MockGameObject.mockActor(), object)).toBe(false);

    schemeState.isDeadlyHit = true;

    expect(callXrCondition("deadly_hit", MockGameObject.mockActor(), object)).toBe(true);
  });
});
