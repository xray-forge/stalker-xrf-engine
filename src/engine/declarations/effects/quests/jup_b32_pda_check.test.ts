import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { MockGameObject } from "xray16/mocks";

import { updateAnomalyZonesDisplay } from "@/engine/core/managers/map/utils";
import { callXrEffect } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/quests/jup_b32_pda_check");
});

jest.mock("@/engine/core/managers/map/utils");

describe("jup_b32_pda_check", () => {
  it("should check pda", () => {
    callXrEffect("jup_b32_pda_check", MockGameObject.mockActor(), MockGameObject.mock());

    expect(updateAnomalyZonesDisplay).toHaveBeenCalledTimes(1);
  });
});
