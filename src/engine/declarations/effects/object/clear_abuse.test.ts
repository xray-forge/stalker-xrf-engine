import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { IRegistryObjectState, registerObject } from "@/engine/core/database";
import { ISchemeAbuseState } from "@/engine/core/schemes/stalker/abuse";
import { setSchemeState } from "@/engine/core/schemes/state";
import { EScheme } from "@/engine/core/schemes/types";
import { callXrEffect } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/object/clear_abuse");
});

describe("clear_abuse", () => {
  it("should clear abuse state", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);
    const abuseController = { clearAbuse: jest.fn() };

    setSchemeState(state, EScheme.ABUSE, { abuseController } as unknown as ISchemeAbuseState);

    callXrEffect("clear_abuse", MockGameObject.mockActor(), object);

    expect(abuseController.clearAbuse).toHaveBeenCalledTimes(1);
  });
});
