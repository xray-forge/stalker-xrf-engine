import { beforeAll, describe, expect, it } from "@jest/globals";
import { MockGameObject } from "xray16/mocks";

import { infoPortions } from "@/engine/constants/info_portions";
import { giveInfoPortion } from "@/engine/core/utils/info_portion";
import { callXrCondition, mockRegisteredActor } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/conditions/quests/jup_b221_who_will_start");
});

describe("jup_b221_who_will_start", () => {
  it("should report and choose available faction themes", () => {
    mockRegisteredActor();

    expect(() => callXrCondition("jup_b221_who_will_start", MockGameObject.mockActor(), MockGameObject.mock())).toThrow(
      "No such parameters in function 'jup_b221_who_will_start'"
    );
    expect(
      callXrCondition("jup_b221_who_will_start", MockGameObject.mockActor(), MockGameObject.mock(), "ability")
    ).toBe(false);

    giveInfoPortion(infoPortions.jup_b25_freedom_flint_gone);

    expect(
      callXrCondition("jup_b221_who_will_start", MockGameObject.mockActor(), MockGameObject.mock(), "ability")
    ).toBe(true);
    expect(
      callXrCondition("jup_b221_who_will_start", MockGameObject.mockActor(), MockGameObject.mock(), "choose")
    ).toBe(true);

    giveInfoPortion("jup_b221_duty_main_1_played");

    expect(
      callXrCondition("jup_b221_who_will_start", MockGameObject.mockActor(), MockGameObject.mock(), "ability")
    ).toBe(false);
  });
});
