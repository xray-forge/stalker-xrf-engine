import { describe, expect, it } from "@jest/globals";

import { baseAnimations } from "@/engine/core/objects/animation/animations/base";
import { EStalkerState } from "@/engine/core/objects/state";
import { assertArraysIntersecting } from "@/fixtures/engine";
import { mockFromLuaTable } from "@/fixtures/lua";

describe("base animations list", () => {
  it("should list all needed animations", () => {
    expect(baseAnimations.length()).toBe(46);

    assertArraysIntersecting(mockFromLuaTable(baseAnimations).getKeysArray(), [
      EStalkerState.IDLE,
      EStalkerState.IDLE_CHASOVOY,
      EStalkerState.CAUTION,
      EStalkerState.POISK,
      EStalkerState.STOOP_NO_WEAP,
      EStalkerState.HIDE,
      EStalkerState.PLAY_GUITAR,
      EStalkerState.PLAY_HARMONICA,
      EStalkerState.HELLO,
      EStalkerState.REFUSE,
      EStalkerState.CLAIM,
      EStalkerState.BACKOFF,
      EStalkerState.PUNCH,
      EStalkerState.SLEEPING,
      EStalkerState.WOUNDED,
      EStalkerState.WOUNDED_HEAVY_1,
      EStalkerState.WOUNDED_HEAVY_2,
      EStalkerState.WOUNDED_HEAVY_3,
      EStalkerState.WOUNDED_ZOMBIE,
      EStalkerState.CHOOSING,
      EStalkerState.PRESS,
      EStalkerState.WARDING,
      EStalkerState.WARDING_SHORT,
      EStalkerState.FOLD_ARMS,
      EStalkerState.TALK_DEFAULT,
      EStalkerState.BINOCULAR,
      EStalkerState.SALUT,
      EStalkerState.SALUT_FREE,
      EStalkerState.HANDS_UP,
      EStalkerState.TRANS_0,
      EStalkerState.TRANS_1,
      EStalkerState.TRANS_ZOMBIED,
      EStalkerState.PROBE_STAND,
      EStalkerState.PROBE_WAY,
      EStalkerState.PROBE_CROUCH,
      EStalkerState.SCANER_STAND,
      EStalkerState.SCANER_WAY,
      EStalkerState.SCANER_CROUCH,
      EStalkerState.PRISONER,
      EStalkerState.RACIYA,
      EStalkerState.CR_RACIYA,
      EStalkerState.PSY_ARMED,
      EStalkerState.PSY_SHOOT,
      EStalkerState.LAY_ON_BED,
      EStalkerState.SEARCH_CORPSE,
      EStalkerState.HELP_WOUNDED,
    ]);
  });
});
