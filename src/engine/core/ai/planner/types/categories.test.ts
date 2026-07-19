import { describe, expect, it } from "@jest/globals";

import { COMBAT_ACTION_IDS, EActionId, NO_IDLE_ALIFE_IDS } from "@/engine/core/ai/planner/types";

describe("planner action categories", () => {
  it("classifies only combat, danger, and anomaly planner actions as combat", () => {
    expect(COMBAT_ACTION_IDS).toEqual({
      [EActionId.COMBAT]: true,
      [EActionId.DANGER]: true,
      [EActionId.ANOMALY]: true,
    });
  });

  it("blocks alife readiness only while the meet waiting action is active", () => {
    expect(NO_IDLE_ALIFE_IDS).toEqual({ [EActionId.MEET_WAITING_ACTIVITY]: true });
  });
});
