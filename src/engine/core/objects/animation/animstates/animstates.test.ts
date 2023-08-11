import { describe, expect, it } from "@jest/globals";

import { EStalkerState } from "@/engine/core/objects/animation";
import { animationAnimstates } from "@/engine/core/objects/animation/animstates/animstates";
import { assertArraysIntersecting } from "@/fixtures/engine";
import { mockFromLuaTable } from "@/fixtures/lua";

describe("base animstates list", () => {
  it("should list all needed animations", () => {
    expect(animationAnimstates.length()).toBe(21);

    assertArraysIntersecting(mockFromLuaTable(animationAnimstates).getKeysArray(), [
      EStalkerState.ANIMPOINT_STAY_WALL,
      EStalkerState.ANIMPOINT_STAY_TABLE,
      EStalkerState.ANIMPOINT_SIT_HIGH,
      EStalkerState.ANIMPOINT_SIT_NORMAL,
      EStalkerState.ANIMPOINT_SIT_LOW,
      EStalkerState.ANIMPOINT_SIT_ASS,
      EStalkerState.ANIMPOINT_SIT_KNEE,
      EStalkerState.ANIMPOINT_STAY_WALL_WEAPON,
      EStalkerState.ANIMPOINT_STAY_TABLE_WEAPON,
      EStalkerState.ANIMPOINT_SIT_HIGH_WEAPON,
      EStalkerState.ANIMPOINT_SIT_NORMAL_WEAPON,
      EStalkerState.ANIMPOINT_SIT_LOW_WEAPON,
      EStalkerState.SIT,
      EStalkerState.SIT_KNEE,
      EStalkerState.SIT_ASS,
      "zat_b3_tech_idle",
      "zat_b22_medic_turn_idle",
      "jup_b15_zulus_sit_idle_short",
      "pri_a21_sentry_madness_idle",
      "pri_a20_colonel_radio",
      "pri_a22_colonel_lean_on_table",
    ]);
  });
});
