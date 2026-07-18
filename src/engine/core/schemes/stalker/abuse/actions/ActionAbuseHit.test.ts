import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { ACTOR_ID } from "xray16/lib";
import { MockGameObject, MockPropertyStorage } from "xray16/mocks";
import { resetFunctionMock } from "xray16/testing/utils";

import { EStalkerState } from "@/engine/core/animation/types";
import { setStalkerState } from "@/engine/core/database/stalker";
import { ISchemeAbuseState } from "@/engine/core/schemes/stalker/abuse/abuse_types";
import { ActionAbuseHit } from "@/engine/core/schemes/stalker/abuse/actions/ActionAbuseHit";
import { EScheme } from "@/engine/core/schemes/types";
import { mockSchemeState, resetRegistry } from "@/fixtures/engine";

jest.mock("@/engine/core/database/stalker");

describe("ActionAbuseHit", () => {
  beforeEach(() => {
    resetRegistry();
    resetFunctionMock(setStalkerState);
  });

  it("should prepare the object and start its punch animation toward the actor", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeAbuseState = mockSchemeState(EScheme.ABUSE);
    const action: ActionAbuseHit = new ActionAbuseHit(state);

    action.setup(object, MockPropertyStorage.mock());
    action.initialize();

    expect(object.set_desired_position).toHaveBeenCalledTimes(1);
    expect(object.set_desired_direction).toHaveBeenCalledTimes(1);
    expect(setStalkerState).toHaveBeenCalledWith(
      object,
      EStalkerState.PUNCH,
      null,
      null,
      { lookObjectId: ACTOR_ID },
      { animation: true }
    );
  });
});
