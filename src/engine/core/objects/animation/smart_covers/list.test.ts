import { describe, expect, it } from "@jest/globals";

import { smartCoversList } from "@/engine/core/objects/animation/smart_covers/list";
import { assertArraysIntersecting } from "@/fixtures/engine";
import { mockFromLuaTable } from "@/fixtures/lua";

describe("smart covers animations list", () => {
  it("should include all needed smar covers in list", () => {
    expect(smartCoversList.length()).toBe(11);

    assertArraysIntersecting(mockFromLuaTable(smartCoversList).getKeysArray(), [
      "combat_prone",
      "combat_front",
      "animpoint_stay_wall",
      "animpoint_stay_table",
      "animpoint_sit_high",
      "animpoint_sit_normal",
      "animpoint_sit_low",
      "animpoint_sit_knee",
      "animpoint_sit_ass",
      "animpoint_pri_a15",
      "anim_pri_a22",
    ]);
  });
});
