import { IAnimationDescriptor } from "@/engine/core/objects/animation/types/animation_types";
import { EStalkerState } from "@/engine/core/objects/animation/types/state_types";
import { createSequence } from "@/engine/core/utils/animation";
import { getExtern } from "@/engine/core/utils/binding";
import { AnyArgs, AnyCallablesModule, TName } from "@/engine/lib/types";

/**
 * List of animstates to use during animation.
 */
export const animationAnimstates: LuaTable<TName, IAnimationDescriptor> = $fromObject<TName, IAnimationDescriptor>({
  [EStalkerState.ANIMPOINT_STAY_WALL]: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80,
      moving: true,
    },
    into: createSequence(["animpoint_stay_wall_in_1"], ["animpoint_stay_wall_in_1"]),
    out: createSequence(["animpoint_stay_wall_out_1"], ["animpoint_stay_wall_out_1"]),
    idle: createSequence("animpoint_stay_wall_idle_1", "animpoint_stay_wall_idle_1"),
    rnd: createSequence(["animpoint_stay_wall_idle_1"], ["animpoint_stay_wall_idle_1"]),
  },
  [EStalkerState.ANIMPOINT_STAY_TABLE]: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80,
      moving: true,
    },
    into: createSequence(["animpoint_stay_table_in_1"], ["animpoint_stay_table_in_1"]),
    out: createSequence(["animpoint_stay_table_out_1"], ["animpoint_stay_table_out_1"]),
    idle: createSequence("animpoint_stay_table_idle_1", "animpoint_stay_table_idle_1"),
    rnd: null,
  },
  [EStalkerState.ANIMPOINT_SIT_HIGH]: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80,
      moving: true,
    },
    into: createSequence(["animpoint_sit_high_in_1"], ["animpoint_sit_high_in_1"]),
    out: createSequence(["animpoint_sit_high_out_1"], ["animpoint_sit_high_out_1"]),
    idle: createSequence("animpoint_sit_high_idle_1", "animpoint_sit_high_idle_1"),
    rnd: null,
  },
  [EStalkerState.ANIMPOINT_SIT_NORMAL]: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80,
      moving: true,
    },
    into: createSequence(["animpoint_sit_normal_in_1"], ["animpoint_sit_normal_in_1"]),
    out: createSequence(["animpoint_sit_normal_out_1"], ["animpoint_sit_normal_out_1"]),
    idle: createSequence("animpoint_sit_normal_idle_1", "animpoint_sit_normal_idle_1"),
    rnd: null,
  },
  [EStalkerState.ANIMPOINT_SIT_LOW]: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80,
      moving: true,
    },
    into: createSequence(["animpoint_sit_low_in_1"], ["animpoint_sit_low_in_1"]),
    out: createSequence(["animpoint_sit_low_out_1"], ["animpoint_sit_low_out_1"]),
    idle: createSequence("animpoint_sit_low_idle_1", "animpoint_sit_low_idle_1"),
    rnd: null,
  },
  [EStalkerState.ANIMPOINT_SIT_ASS]: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80,
      moving: true,
    },
    into: createSequence(["idle_0_to_sit_2"], ["idle_0_to_sit_2"]),
    out: createSequence(["sit_2_to_idle_0"], ["sit_2_to_idle_0"]),
    idle: createSequence("sit_2_idle_0", "sit_2_idle_0"),
    rnd: null,
  },
  [EStalkerState.ANIMPOINT_SIT_KNEE]: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80,
      moving: true,
    },
    into: createSequence(["idle_0_to_sit_1"], ["idle_0_to_sit_1"]),
    out: createSequence(["sit_1_to_idle_0"], ["sit_1_to_idle_0"]),
    idle: createSequence("sit_1_idle_0", "sit_1_idle_0"),
    rnd: null,
  },
  [EStalkerState.ANIMPOINT_STAY_WALL_WEAPON]: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80,
      moving: true,
    },
    into: createSequence(["animpoint_stay_wall_weapon_in_1"], ["animpoint_stay_wall_weapon_in_1"]),
    out: createSequence(["animpoint_stay_wall_weapon_out_1"], ["animpoint_stay_wall_weapon_out_1"]),
    idle: createSequence("animpoint_stay_wall_weapon_idle_1", "animpoint_stay_wall_weapon_idle_1"),
    rnd: createSequence(
      [
        "animpoint_stay_wall_weapon_idle_rnd_1",
        "animpoint_stay_wall_weapon_idle_rnd_2",
        "animpoint_stay_wall_weapon_idle_rnd_3",
        "animpoint_stay_wall_weapon_idle_rnd_4",
      ],
      [
        "animpoint_stay_wall_weapon_idle_rnd_1",
        "animpoint_stay_wall_weapon_idle_rnd_2",
        "animpoint_stay_wall_weapon_idle_rnd_3",
        "animpoint_stay_wall_weapon_idle_rnd_4",
      ]
    ),
  },
  [EStalkerState.ANIMPOINT_STAY_TABLE_WEAPON]: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80,
      moving: true,
    },
    into: createSequence(["animpoint_stay_table_weapon_in_1"], ["animpoint_stay_table_weapon_in_1"]),
    out: createSequence(["animpoint_stay_table_weapon_out_1"], ["animpoint_stay_table_weapon_out_1"]),
    idle: createSequence("animpoint_stay_table_weapon_idle_1", "animpoint_stay_table_weapon_idle_1"),
    rnd: createSequence(
      [
        "animpoint_stay_table_weapon_idle_rnd_1",
        "animpoint_stay_table_weapon_idle_rnd_2",
        "animpoint_stay_table_weapon_idle_rnd_3",
        "animpoint_stay_table_weapon_idle_rnd_4",
        "animpoint_stay_table_weapon_idle_rnd_5",
        "animpoint_stay_table_weapon_idle_rnd_6",
      ],
      [
        "animpoint_stay_table_weapon_idle_rnd_1",
        "animpoint_stay_table_weapon_idle_rnd_2",
        "animpoint_stay_table_weapon_idle_rnd_3",
        "animpoint_stay_table_weapon_idle_rnd_4",
        "animpoint_stay_table_weapon_idle_rnd_5",
        "animpoint_stay_table_weapon_idle_rnd_6",
      ]
    ),
  },
  [EStalkerState.ANIMPOINT_SIT_HIGH_WEAPON]: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80,
      moving: true,
    },
    into: createSequence(["animpoint_sit_high_weapon_in_1"], ["animpoint_sit_high_weapon_in_1"]),
    out: createSequence(["animpoint_sit_high_weapon_out_1"], ["animpoint_sit_high_weapon_out_1"]),
    idle: createSequence("animpoint_sit_high_weapon_idle_1", "animpoint_sit_high_weapon_idle_1"),
    rnd: createSequence(
      [
        "animpoint_sit_high_weapon_idle_rnd_1",
        "animpoint_sit_high_weapon_idle_rnd_2",
        "animpoint_sit_high_weapon_idle_rnd_3",
        "animpoint_sit_high_weapon_idle_rnd_4",
        "animpoint_sit_high_weapon_idle_rnd_5",
        "animpoint_sit_high_weapon_idle_rnd_6",
      ],
      [
        "animpoint_sit_high_weapon_idle_rnd_1",
        "animpoint_sit_high_weapon_idle_rnd_2",
        "animpoint_sit_high_weapon_idle_rnd_3",
        "animpoint_sit_high_weapon_idle_rnd_4",
        "animpoint_sit_high_weapon_idle_rnd_5",
        "animpoint_sit_high_weapon_idle_rnd_6",
      ]
    ),
  },
  [EStalkerState.ANIMPOINT_SIT_NORMAL_WEAPON]: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80,
      moving: true,
    },
    into: createSequence(["animpoint_sit_normal_weapon_in_1"], ["animpoint_sit_normal_weapon_in_1"]),
    out: createSequence(["animpoint_sit_normal_weapon_out_1"], ["animpoint_sit_normal_weapon_out_1"]),
    idle: createSequence("animpoint_sit_normal_weapon_idle_1", "animpoint_sit_normal_weapon_idle_1"),
    rnd: createSequence(
      [
        "animpoint_sit_normal_weapon_idle_rnd_1",
        "animpoint_sit_normal_weapon_idle_rnd_2",
        "animpoint_sit_normal_weapon_idle_rnd_3",
        "animpoint_sit_normal_weapon_idle_rnd_4",
        "animpoint_sit_normal_weapon_idle_rnd_5",
        "animpoint_sit_normal_weapon_idle_rnd_6",
      ],
      [
        "animpoint_sit_normal_weapon_idle_rnd_1",
        "animpoint_sit_normal_weapon_idle_rnd_2",
        "animpoint_sit_normal_weapon_idle_rnd_3",
        "animpoint_sit_normal_weapon_idle_rnd_4",
        "animpoint_sit_normal_weapon_idle_rnd_5",
        "animpoint_sit_normal_weapon_idle_rnd_6",
      ]
    ),
  },
  [EStalkerState.ANIMPOINT_SIT_LOW_WEAPON]: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80,
      moving: true,
    },
    into: createSequence(["animpoint_sit_low_weapon_in_1"], ["animpoint_sit_low_weapon_in_1"]),
    out: createSequence(["animpoint_sit_low_weapon_out_1"], ["animpoint_sit_low_weapon_out_1"]),
    idle: createSequence("animpoint_sit_low_weapon_idle_1", "animpoint_sit_low_weapon_idle_1"),
    rnd: createSequence(
      [
        "animpoint_sit_low_weapon_idle_rnd_1",
        "animpoint_sit_low_weapon_idle_rnd_2",
        "animpoint_sit_low_weapon_idle_rnd_3",
        "animpoint_sit_low_weapon_idle_rnd_4",
        "animpoint_sit_low_weapon_idle_rnd_5",
        "animpoint_sit_low_weapon_idle_rnd_6",
      ],
      [
        "animpoint_sit_low_weapon_idle_rnd_1",
        "animpoint_sit_low_weapon_idle_rnd_2",
        "animpoint_sit_low_weapon_idle_rnd_3",
        "animpoint_sit_low_weapon_idle_rnd_4",
        "animpoint_sit_low_weapon_idle_rnd_5",
        "animpoint_sit_low_weapon_idle_rnd_6",
      ]
    ),
  },
  sit: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80,
      moving: null,
    },
    into: createSequence(["idle_0_to_sit_0"]),
    out: createSequence(["sit_0_to_idle_0"]),
    idle: createSequence("sit_0_idle_0"),
    rnd: createSequence(["sit_0_idle_1", "sit_0_idle_2", "sit_0_idle_3"]),
  },
  sit_knee: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80,
      moving: null,
    },
    into: createSequence(["idle_0_to_sit_1"]),
    out: createSequence(["sit_1_to_idle_0"]),
    idle: createSequence("sit_1_idle_0"),
    rnd: createSequence(["sit_1_idle_1", "sit_1_idle_2", "sit_1_idle_3"]),
  },
  sit_ass: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80,
      moving: null,
    },
    into: createSequence(["idle_0_to_sit_2"]),
    out: createSequence(["sit_2_to_idle_0"]),
    idle: createSequence("sit_2_idle_0"),
    rnd: createSequence(["sit_2_idle_1", "sit_2_idle_2", "sit_2_idle_3"]),
  },
  zat_b3_tech_idle: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: null,
    out: null,
    idle: createSequence("zat_b3_tech_idle", "zat_b3_tech_idle"),
    rnd: null,
  },
  zat_b22_medic_turn_idle: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: null,
    out: null,
    idle: createSequence("zat_b22_medic_turn_idle", "zat_b22_medic_turn_idle"),
    rnd: null,
  },
  jup_b15_zulus_sit_idle_short: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: null,
    out: null,
    idle: createSequence("jup_b15_zulus_sit_idle_short", "jup_b15_zulus_sit_idle_short"),
    rnd: null,
  },
  pri_a21_sentry_madness_idle: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: null,
    out: null,
    idle: createSequence("pri_a21_sentry_madness_idle", "pri_a21_sentry_madness_idle"),
    rnd: null,
  },
  pri_a20_colonel_radio: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequence([
      "pri_a20_colonel_radio_in",
      { f: (...args: AnyArgs) => getExtern<AnyCallablesModule>("xr_effects").pri_a20_radio_start(...args) },
    ]),
    out: createSequence(["pri_a20_colonel_radio_out"]),
    idle: createSequence("pri_a20_colonel_radio_idle"),
    rnd: null,
  },
  pri_a22_colonel_lean_on_table: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequence([
      "pri_a22_colonel_lean_on_tabl_in",
      { f: (...args: AnyArgs) => getExtern<AnyCallablesModule>("xr_effects").pri_a22_kovalski_speak(...args) },
    ]),
    out: createSequence(["pri_a22_colonel_lean_on_tabl_out"]),
    idle: createSequence("pri_a22_colonel_lean_on_tabl_idle"),
    rnd: null,
  },
});
