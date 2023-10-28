import { describe, expect, it } from "@jest/globals";

import { animpointStates } from "@/engine/core/animation/states/animpoint";
import { EStalkerState } from "@/engine/core/animation/types";
import { assertArraysIntersecting } from "@/fixtures/engine";
import { mockFromLuaTable } from "@/fixtures/lua";

describe("animpoint states list", () => {
  it("should list all needed animations", () => {
    expect(animpointStates.length()).toBe(59);

    assertArraysIntersecting(mockFromLuaTable(animpointStates).getKeysArray(), [
      EStalkerState.ANIMPOINT_STAY_WALL,
      EStalkerState.ANIMPOINT_STAY_TABLE,
      EStalkerState.ANIMPOINT_SIT_HIGH,
      EStalkerState.ANIMPOINT_SIT_NORMAL,
      EStalkerState.ANIMPOINT_SIT_LOW,
      EStalkerState.ANIMPOINT_SIT_ASS,
      EStalkerState.ANIMPOINT_SIT_KNEE,
      EStalkerState.ANIMPOINT_STAY_WALL_EAT_BREAD,
      EStalkerState.ANIMPOINT_STAY_WALL_EAT_KOLBASA,
      EStalkerState.ANIMPOINT_STAY_TABLE_EAT_BREAD,
      EStalkerState.ANIMPOINT_STAY_TABLE_EAT_KOLBASA,
      EStalkerState.ANIMPOINT_SIT_HIGH_EAT_BREAD,
      EStalkerState.ANIMPOINT_SIT_HIGH_EAT_KOLBASA,
      EStalkerState.ANIMPOINT_SIT_NORMAL_EAT_BREAD,
      EStalkerState.ANIMPOINT_SIT_NORMAL_EAT_KOLBASA,
      EStalkerState.ANIMPOINT_SIT_LOW_EAT_BREAD,
      EStalkerState.ANIMPOINT_SIT_LOW_EAT_KOLBASA,
      EStalkerState.ANIMPOINT_SIT_ASS_EAT_BREAD,
      EStalkerState.ANIMPOINT_SIT_ASS_EAT_KOLBASA,
      EStalkerState.ANIMPOINT_SIT_KNEE_EAT_BREAD,
      EStalkerState.ANIMPOINT_SIT_KNEE_EAT_KOLBASA,
      EStalkerState.ANIMPOINT_STAY_WALL_DRINK_VODKA,
      EStalkerState.ANIMPOINT_STAY_WALL_DRINK_ENERGY,
      EStalkerState.ANIMPOINT_STAY_TABLE_DRINK_VODKA,
      EStalkerState.ANIMPOINT_STAY_TABLE_DRINK_ENERGY,
      EStalkerState.ANIMPOINT_SIT_HIGH_DRINK_VODKA,
      EStalkerState.ANIMPOINT_SIT_HIGH_DRINK_ENERGY,
      EStalkerState.ANIMPOINT_SIT_NORMAL_DRINK_VODKA,
      EStalkerState.ANIMPOINT_SIT_NORMAL_DRINK_ENERGY,
      EStalkerState.ANIMPOINT_SIT_LOW_DRINK_VODKA,
      EStalkerState.ANIMPOINT_SIT_LOW_DRINK_ENERGY,
      EStalkerState.ANIMPOINT_SIT_ASS_DRINK_VODKA,
      EStalkerState.ANIMPOINT_SIT_ASS_DRINK_ENERGY,
      EStalkerState.ANIMPOINT_SIT_KNEE_DRINK_VODKA,
      EStalkerState.ANIMPOINT_SIT_KNEE_DRINK_ENERGY,
      EStalkerState.ANIMPOINT_STAY_WALL_GUITAR,
      EStalkerState.ANIMPOINT_STAY_TABLE_GUITAR,
      EStalkerState.ANIMPOINT_SIT_HIGH_GUITAR,
      EStalkerState.ANIMPOINT_SIT_NORMAL_GUITAR,
      EStalkerState.ANIMPOINT_SIT_LOW_GUITAR,
      EStalkerState.ANIMPOINT_SIT_ASS_GUITAR,
      EStalkerState.ANIMPOINT_SIT_KNEE_GUITAR,
      EStalkerState.ANIMPOINT_STAY_WALL_HARMONICA,
      EStalkerState.ANIMPOINT_STAY_TABLE_HARMONICA,
      EStalkerState.ANIMPOINT_SIT_HIGH_HARMONICA,
      EStalkerState.ANIMPOINT_SIT_NORMAL_HARMONICA,
      EStalkerState.ANIMPOINT_SIT_LOW_HARMONICA,
      EStalkerState.ANIMPOINT_SIT_ASS_HARMONICA,
      EStalkerState.ANIMPOINT_SIT_KNEE_HARMONICA,
      EStalkerState.ANIMPOINT_STAY_WALL_WEAPON,
      EStalkerState.ANIMPOINT_STAY_TABLE_WEAPON,
      EStalkerState.ANIMPOINT_SIT_HIGH_WEAPON,
      EStalkerState.ANIMPOINT_SIT_NORMAL_WEAPON,
      EStalkerState.ANIMPOINT_SIT_LOW_WEAPON,
      EStalkerState.ANIMPOINT_STAY_WALL_NO_RND,
      EStalkerState.ANIMPOINT_STAY_TABLE_NO_RND,
      EStalkerState.ANIMPOINT_SIT_HIGH_NO_RND,
      EStalkerState.ANIMPOINT_SIT_NORMAL_NO_RND,
      EStalkerState.ANIMPOINT_SIT_LOW_NO_RND,
    ]);
  });
});
