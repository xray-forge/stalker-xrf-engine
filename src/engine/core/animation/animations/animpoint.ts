import { startPlayingGuitar, startPlayingHarmonica } from "@/engine/core/ai/camp/camp_utils";
import { IAnimationDescriptor } from "@/engine/core/animation/types/animation_types";
import { EStalkerState } from "@/engine/core/animation/types/state_types";
import { createSequence } from "@/engine/core/utils/animation";
import { food } from "@/engine/lib/constants/items/food";
import { misc } from "@/engine/lib/constants/items/misc";
import { GameObject, TName } from "@/engine/lib/types";

/**
 * List of animpoint animations.
 */
export const animpointAnimations: LuaTable<TName, IAnimationDescriptor> = $fromObject<TName, IAnimationDescriptor>({
  [EStalkerState.ANIMPOINT_STAY_WALL]: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80,
      moving: true,
    },
    into: null,
    out: null,
    idle: createSequence("animpoint_stay_wall_idle_1", "animpoint_stay_wall_idle_1"),
    rnd: createSequence(
      [
        "animpoint_stay_wall_idle_rnd_1",
        "animpoint_stay_wall_idle_rnd_2",
        "animpoint_stay_wall_idle_rnd_3",
        "animpoint_stay_wall_idle_rnd_4",
      ],
      [
        "animpoint_stay_wall_idle_rnd_1",
        "animpoint_stay_wall_idle_rnd_2",
        "animpoint_stay_wall_idle_rnd_3",
        "animpoint_stay_wall_idle_rnd_4",
      ]
    ),
  },
  [EStalkerState.ANIMPOINT_STAY_TABLE]: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80,
      moving: true,
    },
    into: null,
    out: null,
    idle: createSequence("animpoint_stay_table_idle_1", "animpoint_stay_table_idle_1"),
    rnd: createSequence(
      [
        "animpoint_stay_table_idle_rnd_1",
        "animpoint_stay_table_idle_rnd_2",
        "animpoint_stay_table_idle_rnd_3",
        "animpoint_stay_table_idle_rnd_4",
        "animpoint_stay_table_idle_rnd_5",
      ],
      [
        "animpoint_stay_table_idle_rnd_1",
        "animpoint_stay_table_idle_rnd_2",
        "animpoint_stay_table_idle_rnd_3",
        "animpoint_stay_table_idle_rnd_4",
        "animpoint_stay_table_idle_rnd_5",
      ]
    ),
  },
  [EStalkerState.ANIMPOINT_SIT_HIGH]: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80,
      moving: true,
    },
    into: null,
    out: null,
    idle: createSequence("animpoint_sit_high_idle_1", "animpoint_sit_high_idle_1"),
    rnd: createSequence(
      [
        "animpoint_sit_high_idle_rnd_1",
        "animpoint_sit_high_idle_rnd_2",
        "animpoint_sit_high_idle_rnd_3",
        "animpoint_sit_high_idle_rnd_4",
      ],
      [
        "animpoint_sit_high_idle_rnd_1",
        "animpoint_sit_high_idle_rnd_2",
        "animpoint_sit_high_idle_rnd_3",
        "animpoint_sit_high_idle_rnd_4",
      ]
    ),
  },
  [EStalkerState.ANIMPOINT_SIT_NORMAL]: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80,
      moving: true,
    },
    into: null,
    out: null,
    idle: createSequence("animpoint_sit_normal_idle_1", "animpoint_sit_normal_idle_1"),
    rnd: createSequence(
      [
        "animpoint_sit_normal_idle_rnd_1",
        "animpoint_sit_normal_idle_rnd_2",
        "animpoint_sit_normal_idle_rnd_3",
        "animpoint_sit_normal_idle_rnd_4",
      ],
      [
        "animpoint_sit_normal_idle_rnd_1",
        "animpoint_sit_normal_idle_rnd_2",
        "animpoint_sit_normal_idle_rnd_3",
        "animpoint_sit_normal_idle_rnd_4",
      ]
    ),
  },
  [EStalkerState.ANIMPOINT_SIT_LOW]: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80,
      moving: true,
    },
    into: null,
    out: null,
    idle: createSequence("animpoint_sit_low_idle_1", "animpoint_sit_low_idle_1"),
    rnd: createSequence(
      [
        "animpoint_sit_low_idle_rnd_1",
        "animpoint_sit_low_idle_rnd_2",
        "animpoint_sit_low_idle_rnd_3",
        "animpoint_sit_low_idle_rnd_4",
      ],
      [
        "animpoint_sit_low_idle_rnd_1",
        "animpoint_sit_low_idle_rnd_2",
        "animpoint_sit_low_idle_rnd_3",
        "animpoint_sit_low_idle_rnd_4",
      ]
    ),
  },
  [EStalkerState.ANIMPOINT_SIT_ASS]: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80,
      moving: true,
    },
    into: null,
    out: null,
    idle: createSequence("sit_2_idle_0", "sit_2_idle_0"),
    rnd: createSequence(
      ["sit_2_idle_1", "sit_2_idle_2", "sit_2_idle_3"],
      ["sit_2_idle_1", "sit_2_idle_2", "sit_2_idle_3"]
    ),
  },
  [EStalkerState.ANIMPOINT_SIT_KNEE]: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80,
      moving: true,
    },
    into: null,
    out: null,
    idle: createSequence("sit_1_idle_0", "sit_1_idle_0"),
    rnd: createSequence(
      ["sit_1_idle_1", "sit_1_idle_2", "sit_1_idle_3"],
      ["sit_1_idle_1", "sit_1_idle_2", "sit_1_idle_3"]
    ),
  },
  [EStalkerState.ANIMPOINT_STAY_WALL_EAT_BREAD]: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80,
      moving: true,
    },
    into: createSequence(
      ["animpoint_stay_wall_eat_in_1", { a: "bread" }, "animpoint_stay_wall_eat_in_2"],
      ["animpoint_stay_wall_eat_in_1", { a: "bread" }, "animpoint_stay_wall_eat_in_2"]
    ),
    out: createSequence(
      ["animpoint_stay_wall_eat_out_1", { d: "bread" }, "animpoint_stay_wall_eat_out_2"],
      ["animpoint_stay_wall_eat_out_1", { d: "bread" }, "animpoint_stay_wall_eat_out_2"]
    ),
    idle: createSequence("animpoint_stay_wall_eat_idle_1", "animpoint_stay_wall_eat_idle_1"),
    rnd: createSequence(
      ["animpoint_stay_wall_eat_idle_rnd_1", "animpoint_stay_wall_eat_idle_rnd_2"],
      ["animpoint_stay_wall_eat_idle_rnd_1", "animpoint_stay_wall_eat_idle_rnd_2"]
    ),
  },
  [EStalkerState.ANIMPOINT_STAY_WALL_EAT_KOLBASA]: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80,
      moving: true,
    },
    into: createSequence(
      ["animpoint_stay_wall_eat_in_1", { a: "kolbasa" }, "animpoint_stay_wall_eat_in_2"],
      ["animpoint_stay_wall_eat_in_1", { a: "kolbasa" }, "animpoint_stay_wall_eat_in_2"]
    ),
    out: createSequence(
      ["animpoint_stay_wall_eat_out_1", { d: "kolbasa" }, "animpoint_stay_wall_eat_out_2"],
      ["animpoint_stay_wall_eat_out_1", { d: "kolbasa" }, "animpoint_stay_wall_eat_out_2"]
    ),
    idle: createSequence("animpoint_stay_wall_eat_idle_1", "animpoint_stay_wall_eat_idle_1"),
    rnd: createSequence(["animpoint_stay_wall_eat_idle_rnd_1"], ["animpoint_stay_wall_eat_idle_rnd_1"]),
  },
  [EStalkerState.ANIMPOINT_STAY_TABLE_EAT_BREAD]: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80,
      moving: true,
    },
    into: null,
    out: null,
    idle: createSequence("animpoint_stay_table_idle_1", "animpoint_stay_table_idle_1"),
    rnd: createSequence(["animpoint_stay_table_idle_1"], ["animpoint_stay_table_idle_1"]),
  },
  [EStalkerState.ANIMPOINT_STAY_TABLE_EAT_KOLBASA]: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80,
      moving: true,
    },
    into: null,
    out: null,
    idle: createSequence("animpoint_stay_table_idle_1", "animpoint_stay_table_idle_1"),
    rnd: createSequence(["animpoint_stay_table_idle_1"], ["animpoint_stay_table_idle_1"]),
  },
  [EStalkerState.ANIMPOINT_SIT_HIGH_EAT_BREAD]: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80,
      moving: true,
    },
    into: createSequence(
      ["animpoint_sit_high_eat_in_1", { a: "bread" }, "animpoint_sit_high_eat_in_2"],
      ["animpoint_sit_high_eat_in_1", { a: "bread" }, "animpoint_sit_high_eat_in_2"]
    ),
    out: createSequence(
      ["animpoint_sit_high_eat_out_1", { d: "bread" }, "animpoint_sit_high_eat_out_2"],
      ["animpoint_sit_high_eat_out_1", { d: "bread" }, "animpoint_sit_high_eat_out_2"]
    ),
    idle: createSequence("animpoint_sit_high_eat_idle_1", "animpoint_sit_high_eat_idle_1"),
    rnd: createSequence(
      ["animpoint_sit_high_eat_idle_rnd_1", "animpoint_sit_high_eat_idle_rnd_2"],
      ["animpoint_sit_high_eat_idle_rnd_1", "animpoint_sit_high_eat_idle_rnd_2"]
    ),
  },
  [EStalkerState.ANIMPOINT_SIT_HIGH_EAT_KOLBASA]: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80,
      moving: true,
    },
    into: createSequence(
      ["animpoint_sit_high_eat_in_1", { a: "kolbasa" }, "animpoint_sit_high_eat_in_2"],
      ["animpoint_sit_high_eat_in_1", { a: "kolbasa" }, "animpoint_sit_high_eat_in_2"]
    ),
    out: createSequence(
      ["animpoint_sit_high_eat_out_1", { d: "kolbasa" }, "animpoint_sit_high_eat_out_2"],
      ["animpoint_sit_high_eat_out_1", { d: "kolbasa" }, "animpoint_sit_high_eat_out_2"]
    ),
    idle: createSequence("animpoint_sit_high_eat_idle_1", "animpoint_sit_high_eat_idle_1"),
    rnd: createSequence(["animpoint_sit_high_eat_idle_rnd_1"], ["animpoint_sit_high_eat_idle_rnd_1"]),
  },
  [EStalkerState.ANIMPOINT_SIT_NORMAL_EAT_BREAD]: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80,
      moving: true,
    },
    into: createSequence(
      ["animpoint_sit_normal_eat_in_1", { a: "bread" }, "animpoint_sit_normal_eat_in_2"],
      ["animpoint_sit_normal_eat_in_1", { a: "bread" }, "animpoint_sit_normal_eat_in_2"]
    ),
    out: createSequence(
      ["animpoint_sit_normal_eat_out_1", { d: "bread" }, "animpoint_sit_normal_eat_out_2"],
      ["animpoint_sit_normal_eat_out_1", { d: "bread" }, "animpoint_sit_normal_eat_out_2"]
    ),
    idle: createSequence("animpoint_sit_normal_eat_idle_1", "animpoint_sit_normal_eat_idle_1"),
    rnd: createSequence(
      ["animpoint_sit_normal_eat_idle_rnd_1", "animpoint_sit_normal_eat_idle_rnd_2"],
      ["animpoint_sit_normal_eat_idle_rnd_1", "animpoint_sit_normal_eat_idle_rnd_2"]
    ),
  },
  [EStalkerState.ANIMPOINT_SIT_NORMAL_EAT_KOLBASA]: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80,
      moving: true,
    },
    into: createSequence(
      ["animpoint_sit_normal_eat_in_1", { a: "kolbasa" }, "animpoint_sit_normal_eat_in_2"],
      ["animpoint_sit_normal_eat_in_1", { a: "kolbasa" }, "animpoint_sit_normal_eat_in_2"]
    ),
    out: createSequence(
      ["animpoint_sit_normal_eat_out_1", { d: "kolbasa" }, "animpoint_sit_normal_eat_out_2"],
      ["animpoint_sit_normal_eat_out_1", { d: "kolbasa" }, "animpoint_sit_normal_eat_out_2"]
    ),
    idle: createSequence("animpoint_sit_normal_eat_idle_1", "animpoint_sit_normal_eat_idle_1"),
    rnd: createSequence(["animpoint_sit_normal_eat_idle_1"], ["animpoint_sit_normal_eat_idle_1"]),
  },
  [EStalkerState.ANIMPOINT_SIT_LOW_EAT_BREAD]: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80,
      moving: true,
    },
    into: createSequence(
      ["animpoint_sit_low_eat_in_1", { a: "bread" }, "animpoint_sit_low_eat_in_2"],
      ["animpoint_sit_low_eat_in_1", { a: "bread" }, "animpoint_sit_low_eat_in_2"]
    ),
    out: createSequence(
      ["animpoint_sit_low_eat_out_1", { d: "bread" }, "animpoint_sit_low_eat_out_2"],
      ["animpoint_sit_low_eat_out_1", { d: "bread" }, "animpoint_sit_low_eat_out_2"]
    ),
    idle: createSequence("animpoint_sit_low_eat_idle_1", "animpoint_sit_low_eat_idle_1"),
    rnd: createSequence(
      ["animpoint_sit_low_eat_idle_1", "animpoint_sit_low_eat_idle_2"],
      ["animpoint_sit_low_eat_idle_1", "animpoint_sit_low_eat_idle_2"]
    ),
  },
  [EStalkerState.ANIMPOINT_SIT_LOW_EAT_KOLBASA]: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80,
      moving: true,
    },
    into: createSequence(
      ["animpoint_sit_low_eat_in_1", { a: "kolbasa" }, "animpoint_sit_low_eat_in_2"],
      ["animpoint_sit_low_eat_in_1", { a: "kolbasa" }, "animpoint_sit_low_eat_in_2"]
    ),
    out: createSequence(
      ["animpoint_sit_low_eat_out_1", { d: "kolbasa" }, "animpoint_sit_low_eat_out_2"],
      ["animpoint_sit_low_eat_out_1", { d: "kolbasa" }, "animpoint_sit_low_eat_out_2"]
    ),
    idle: createSequence("animpoint_sit_low_eat_idle_1", "animpoint_sit_low_eat_idle_1"),
    rnd: createSequence(["animpoint_sit_low_eat_idle_1"], ["animpoint_sit_low_eat_idle_1"]),
  },
  [EStalkerState.ANIMPOINT_SIT_ASS_EAT_BREAD]: {
    prop: {
      maxidle: 3,
      sumidle: 3,
      rnd: 80,
      moving: null,
    },
    into: createSequence(
      ["item_2_draw_0", { a: food.bread }, "item_2_draw_1"],
      ["item_2_draw_0", { a: food.bread }, "item_2_draw_1"]
    ),
    out: createSequence(
      ["item_2_holster_1", { d: food.bread }, "item_2_holster_0"],
      ["item_2_holster_1", { d: food.bread }, "item_2_holster_0"]
    ),
    idle: createSequence("item_2_aim_0", "item_2_aim_0"),
    rnd: createSequence(["item_2_prepare_0", "item_2_attack_0"], ["item_2_prepare_0", "item_2_attack_0"]),
  },
  [EStalkerState.ANIMPOINT_SIT_ASS_EAT_KOLBASA]: {
    prop: {
      maxidle: 3,
      sumidle: 3,
      rnd: 80,
      moving: null,
    },
    into: createSequence(
      ["item_1_draw_0", { a: food.kolbasa }, "item_1_draw_1"],
      ["item_1_draw_0", { a: food.kolbasa }, "item_1_draw_1"]
    ),
    out: createSequence(
      ["item_1_holster_0", { d: food.kolbasa }, "item_1_holster_1"],
      ["item_1_holster_0", { d: food.kolbasa }, "item_1_holster_1"]
    ),
    idle: createSequence("item_1_idle_1", "item_1_idle_1"),
    rnd: createSequence(["item_1_attack_0", "item_1_idle_0"], ["item_1_attack_0", "item_1_idle_0"]),
  },
  [EStalkerState.ANIMPOINT_SIT_KNEE_EAT_BREAD]: {
    prop: {
      maxidle: 3,
      sumidle: 3,
      rnd: 80,
      moving: null,
    },
    into: createSequence(
      ["item_2_draw_0", { a: food.bread }, "item_2_draw_1"],
      ["item_2_draw_0", { a: food.bread }, "item_2_draw_1"]
    ),
    out: createSequence(
      ["item_2_holster_0", { d: food.bread }, "item_2_holster_1"],
      ["item_2_holster_0", { d: food.bread }, "item_2_holster_1"]
    ),
    idle: createSequence("item_2_aim_0", "item_2_aim_0"),
    rnd: createSequence(["item_2_prepare_0", "item_2_attack_0"], ["item_2_prepare_0", "item_2_attack_0"]),
  },
  [EStalkerState.ANIMPOINT_SIT_KNEE_EAT_KOLBASA]: {
    prop: {
      maxidle: 3,
      sumidle: 3,
      rnd: 80,
      moving: null,
    },
    into: createSequence(
      ["item_1_draw_0", { a: food.kolbasa }, "item_1_draw_1"],
      ["item_1_draw_0", { a: food.kolbasa }, "item_1_draw_1"]
    ),
    out: createSequence(
      ["item_1_holster_0", { d: food.kolbasa }, "item_1_holster_1"],
      ["item_1_holster_0", { d: food.kolbasa }, "item_1_holster_1"]
    ),
    idle: createSequence("item_1_idle_1", "item_1_idle_1"),
    rnd: createSequence(["item_1_attack_0", "item_1_idle_0"], ["item_1_attack_0", "item_1_idle_0"]),
  },
  [EStalkerState.ANIMPOINT_STAY_WALL_DRINK_VODKA]: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80,
      moving: true,
    },
    into: createSequence(
      ["animpoint_stay_wall_drink_in_1", { a: food.vodka }, "animpoint_stay_wall_drink_in_2"],
      ["animpoint_stay_wall_drink_in_1", { a: food.vodka }, "animpoint_stay_wall_drink_in_2"]
    ),
    out: createSequence(
      ["animpoint_stay_wall_drink_out_1", { d: food.vodka }, "animpoint_stay_wall_drink_out_2"],
      ["animpoint_stay_wall_drink_out_1", { d: food.vodka }, "animpoint_stay_wall_drink_out_2"]
    ),
    idle: createSequence("animpoint_stay_wall_drink_idle_1", "animpoint_stay_wall_drink_idle_1"),
    rnd: createSequence(
      ["animpoint_stay_wall_drink_idle_rnd_1", "animpoint_stay_wall_drink_idle_rnd_2"],
      ["animpoint_stay_wall_drink_idle_rnd_1", "animpoint_stay_wall_drink_idle_rnd_2"]
    ),
  },
  [EStalkerState.ANIMPOINT_STAY_WALL_DRINK_ENERGY]: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80,
      moving: true,
    },
    into: createSequence(
      ["animpoint_stay_wall_drink_in_1", { a: food.energy_drink }, "animpoint_stay_wall_drink_in_2"],
      ["animpoint_stay_wall_drink_in_1", { a: food.energy_drink }, "animpoint_stay_wall_drink_in_2"]
    ),
    out: createSequence(
      ["animpoint_stay_wall_drink_out_1", { d: food.energy_drink }, "animpoint_stay_wall_drink_out_2"],
      ["animpoint_stay_wall_drink_out_1", { d: food.energy_drink }, "animpoint_stay_wall_drink_out_2"]
    ),
    idle: createSequence("animpoint_stay_wall_drink_idle_1", "animpoint_stay_wall_drink_idle_1"),
    rnd: createSequence(["animpoint_stay_wall_drink_idle_1"], ["animpoint_stay_wall_drink_idle_1"]),
  },
  [EStalkerState.ANIMPOINT_STAY_TABLE_DRINK_VODKA]: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80,
      moving: true,
    },
    into: null,
    out: null,
    idle: createSequence("animpoint_stay_table_idle_1", "animpoint_stay_table_idle_1"),
    rnd: createSequence(["animpoint_stay_table_idle_1"], ["animpoint_stay_table_idle_1"]),
  },
  [EStalkerState.ANIMPOINT_STAY_TABLE_DRINK_ENERGY]: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80,
      moving: true,
    },
    into: null,
    out: null,
    idle: createSequence("animpoint_stay_table_idle_1", "animpoint_stay_table_idle_1"),
    rnd: createSequence(["animpoint_stay_table_idle_1"], ["animpoint_stay_table_idle_1"]),
  },
  [EStalkerState.ANIMPOINT_SIT_HIGH_DRINK_VODKA]: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80,
      moving: true,
    },
    into: createSequence(
      ["animpoint_sit_high_drink_in_1", { a: food.vodka }, "animpoint_sit_high_drink_in_2"],
      ["animpoint_sit_high_drink_in_1", { a: food.vodka }, "animpoint_sit_high_drink_in_2"]
    ),
    out: createSequence(
      ["animpoint_sit_high_drink_out_1", { d: food.vodka }, "animpoint_sit_high_drink_out_2"],
      ["animpoint_sit_high_drink_out_1", { d: food.vodka }, "animpoint_sit_high_drink_out_2"]
    ),
    idle: createSequence("animpoint_sit_high_drink_idle_1", "animpoint_sit_high_drink_idle_1"),
    rnd: createSequence(
      ["animpoint_sit_high_drink_idle_rnd_1", "animpoint_sit_high_drink_idle_rnd_2"],
      ["animpoint_sit_high_drink_idle_rnd_1", "animpoint_sit_high_drink_idle_rnd_2"]
    ),
  },
  [EStalkerState.ANIMPOINT_SIT_HIGH_DRINK_ENERGY]: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80,
      moving: true,
    },
    into: createSequence(
      ["animpoint_sit_high_drink_in_1", { a: food.energy_drink }, "animpoint_sit_high_drink_in_2"],
      ["animpoint_sit_high_drink_in_1", { a: food.energy_drink }, "animpoint_sit_high_drink_in_2"]
    ),
    out: createSequence(
      ["animpoint_sit_high_drink_out_1", { d: food.energy_drink }, "animpoint_sit_high_drink_out_2"],
      ["animpoint_sit_high_drink_out_1", { d: food.energy_drink }, "animpoint_sit_high_drink_out_2"]
    ),
    idle: createSequence("animpoint_sit_high_drink_idle_1", "animpoint_sit_high_drink_idle_1"),
    rnd: createSequence(["animpoint_sit_high_drink_idle_rnd_1"], ["animpoint_sit_high_drink_idle_rnd_1"]),
  },
  [EStalkerState.ANIMPOINT_SIT_NORMAL_DRINK_VODKA]: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80,
      moving: true,
    },
    into: createSequence(
      ["animpoint_sit_normal_drink_in_1", { a: food.vodka }, "animpoint_sit_normal_drink_in_2"],
      ["animpoint_sit_normal_drink_in_1", { a: food.vodka }, "animpoint_sit_normal_drink_in_2"]
    ),
    out: createSequence(
      ["animpoint_sit_normal_drink_out_1", { d: food.vodka }, "animpoint_sit_normal_drink_out_2"],
      ["animpoint_sit_normal_drink_out_1", { d: food.vodka }, "animpoint_sit_normal_drink_out_2"]
    ),
    idle: createSequence("animpoint_sit_normal_drink_idle_1", "animpoint_sit_normal_drink_idle_1"),
    rnd: createSequence(
      ["animpoint_sit_normal_drink_idle_rnd_1", "animpoint_sit_normal_drink_idle_rnd_2"],
      ["animpoint_sit_normal_drink_idle_rnd_1", "animpoint_sit_normal_drink_idle_rnd_2"]
    ),
  },
  [EStalkerState.ANIMPOINT_SIT_NORMAL_DRINK_ENERGY]: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80,
      moving: true,
    },
    into: createSequence(
      ["animpoint_sit_normal_drink_in_1", { a: food.energy_drink }, "animpoint_sit_normal_drink_in_2"],
      ["animpoint_sit_normal_drink_in_1", { a: food.energy_drink }, "animpoint_sit_normal_drink_in_2"]
    ),
    out: createSequence(
      ["animpoint_sit_normal_drink_out_1", { d: food.energy_drink }, "animpoint_sit_normal_drink_out_2"],
      ["animpoint_sit_normal_drink_out_1", { d: food.energy_drink }, "animpoint_sit_normal_drink_out_2"]
    ),
    idle: createSequence("animpoint_sit_normal_drink_idle_1", "animpoint_sit_normal_drink_idle_1"),
    rnd: createSequence(["animpoint_sit_normal_drink_idle_1"], ["animpoint_sit_normal_drink_idle_1"]),
  },
  [EStalkerState.ANIMPOINT_SIT_LOW_DRINK_VODKA]: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80,
      moving: true,
    },
    into: createSequence(
      ["animpoint_sit_low_drink_in_1", { a: food.vodka }, "animpoint_sit_low_drink_in_2"],
      ["animpoint_sit_low_drink_in_1", { a: food.vodka }, "animpoint_sit_low_drink_in_2"]
    ),
    out: createSequence(
      ["animpoint_sit_low_drink_out_1", { d: food.vodka }, "animpoint_sit_low_drink_out_2"],
      ["animpoint_sit_low_drink_out_1", { d: food.vodka }, "animpoint_sit_low_drink_out_2"]
    ),
    idle: createSequence("animpoint_sit_low_drink_idle_1", "animpoint_sit_low_drink_idle_1"),
    rnd: createSequence(
      ["animpoint_sit_low_drink_idle_rnd_1", "animpoint_sit_low_drink_idle_rnd_2"],
      ["animpoint_sit_low_drink_idle_rnd_1", "animpoint_sit_low_drink_idle_rnd_2"]
    ),
  },
  [EStalkerState.ANIMPOINT_SIT_LOW_DRINK_ENERGY]: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80,
      moving: true,
    },
    into: createSequence(
      ["animpoint_sit_low_drink_in_1", { a: food.energy_drink }, "animpoint_sit_low_drink_in_2"],
      ["animpoint_sit_low_drink_in_1", { a: food.energy_drink }, "animpoint_sit_low_drink_in_2"]
    ),
    out: createSequence(
      ["animpoint_sit_low_drink_out_1", { d: food.energy_drink }, "animpoint_sit_low_drink_out_2"],
      ["animpoint_sit_low_drink_out_1", { d: food.energy_drink }, "animpoint_sit_low_drink_out_2"]
    ),
    idle: createSequence("animpoint_sit_low_drink_idle_1", "animpoint_sit_low_drink_idle_1"),
    rnd: createSequence(["animpoint_sit_low_drink_idle_rnd_1"], ["animpoint_sit_low_drink_idle_rnd_1"]),
  },
  [EStalkerState.ANIMPOINT_SIT_ASS_DRINK_VODKA]: {
    prop: {
      maxidle: 3,
      sumidle: 3,
      rnd: 80,
      moving: null,
    },
    into: createSequence(
      ["item_4_draw_0", { a: food.vodka }, "item_4_draw_1"],
      ["item_4_draw_0", { a: food.vodka }, "item_4_draw_1"]
    ),
    out: createSequence(
      ["item_4_holster_0", { d: food.vodka }, "item_4_holster_1"],
      ["item_4_holster_0", { d: food.vodka }, "item_4_holster_1"]
    ),
    idle: createSequence("item_4_aim_0", "item_4_aim_0"),
    rnd: createSequence(["item_4_prepare_0", "item_4_attack_0"], ["item_4_prepare_0", "item_4_attack_0"]),
  },
  [EStalkerState.ANIMPOINT_SIT_ASS_DRINK_ENERGY]: {
    prop: {
      maxidle: 3,
      sumidle: 3,
      rnd: 80,
      moving: null,
    },
    into: createSequence(
      ["item_5_draw_0", { a: food.energy_drink }, "item_5_draw_1"],
      ["item_5_draw_0", { a: food.energy_drink }, "item_5_draw_1"]
    ),
    out: createSequence(
      ["item_5_holster_0", { d: food.energy_drink }, "item_5_holster_1"],
      ["item_5_holster_0", { d: food.energy_drink }, "item_5_holster_1"]
    ),
    idle: createSequence("item_5_aim_0", "item_5_aim_0"),
    rnd: createSequence(["item_5_prepare_0", "item_5_attack_0"], ["item_5_prepare_0", "item_5_attack_0"]),
  },
  [EStalkerState.ANIMPOINT_SIT_KNEE_DRINK_VODKA]: {
    prop: {
      maxidle: 3,
      sumidle: 3,
      rnd: 80,
      moving: null,
    },
    into: createSequence(
      ["item_4_draw_0", { a: food.vodka }, "item_4_draw_1"],
      ["item_4_draw_0", { a: food.vodka }, "item_4_draw_1"]
    ),
    out: createSequence(
      ["item_4_holster_0", { d: food.vodka }, "item_4_holster_1"],
      ["item_4_holster_0", { d: food.vodka }, "item_4_holster_1"]
    ),
    idle: createSequence("item_4_aim_0", "item_4_aim_0"),
    rnd: createSequence(["item_4_prepare_0", "item_4_attack_0"], ["item_4_prepare_0", "item_4_attack_0"]),
  },
  [EStalkerState.ANIMPOINT_SIT_KNEE_DRINK_ENERGY]: {
    prop: {
      maxidle: 3,
      sumidle: 3,
      rnd: 80,
      moving: null,
    },
    into: createSequence(
      ["item_5_draw_0", { a: food.energy_drink }, "item_5_draw_1"],
      ["item_5_draw_0", { a: food.energy_drink }, "item_5_draw_1"]
    ),
    out: createSequence(
      ["item_5_holster_0", { d: food.energy_drink }, "item_5_holster_1"],
      ["item_5_holster_0", { d: food.energy_drink }, "item_5_holster_1"]
    ),
    idle: createSequence("item_5_aim_0", "item_5_aim_0"),
    rnd: createSequence(["item_5_prepare_0", "item_5_attack_0"], ["item_5_prepare_0", "item_5_attack_0"]),
  },
  [EStalkerState.ANIMPOINT_STAY_WALL_GUITAR]: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80,
      moving: true,
    },
    into: null,
    out: null,
    idle: createSequence("idle_0_idle_1", "idle_0_idle_1"),
    rnd: createSequence(["idle_0_idle_0"], ["idle_0_idle_0"]),
  },
  [EStalkerState.ANIMPOINT_STAY_TABLE_GUITAR]: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80,
      moving: true,
    },
    into: null,
    out: null,
    idle: createSequence("idle_0_idle_1", "idle_0_idle_1"),
    rnd: createSequence(["idle_0_idle_0"], ["idle_0_idle_0"]),
  },
  [EStalkerState.ANIMPOINT_SIT_HIGH_GUITAR]: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80,
      moving: true,
    },
    into: null,
    out: null,
    idle: createSequence("idle_0_idle_1", "idle_0_idle_1"),
    rnd: createSequence(["idle_0_idle_0"], ["idle_0_idle_0"]),
  },
  [EStalkerState.ANIMPOINT_SIT_NORMAL_GUITAR]: {
    prop: {
      maxidle: 0,
      sumidle: 0,
      rnd: 100,
      moving: true,
    },
    into: createSequence(
      [
        "animpoint_sit_normal_guitar_in_1",
        { a: misc.guitar_a },
        {
          f: startPlayingGuitar,
        },
        "animpoint_sit_normal_guitar_in_2",
      ],
      [
        "animpoint_sit_normal_guitar_in_1",
        { a: misc.guitar_a },
        {
          f: startPlayingGuitar,
        },
        "animpoint_sit_normal_guitar_in_2",
      ]
    ),
    out: createSequence(
      ["animpoint_sit_normal_guitar_out_1", { d: misc.guitar_a }, "animpoint_sit_normal_guitar_out_2"],
      ["animpoint_sit_normal_guitar_out_1", { d: misc.guitar_a }, "animpoint_sit_normal_guitar_out_2"]
    ),
    idle: createSequence("animpoint_sit_normal_guitar_idle_1", "animpoint_sit_normal_guitar_idle_1"),
    rnd: createSequence(["animpoint_sit_normal_guitar_idle_rnd_1"], ["animpoint_sit_normal_guitar_idle_rnd_1"]),
  },
  [EStalkerState.ANIMPOINT_SIT_LOW_GUITAR]: {
    prop: {
      maxidle: 0,
      sumidle: 0,
      rnd: 100,
      moving: true,
    },
    into: createSequence(
      [
        "animpoint_sit_low_guitar_in_1",
        { a: misc.guitar_a },
        {
          f: startPlayingGuitar,
        },
        "animpoint_sit_low_guitar_in_2",
      ],
      [
        "animpoint_sit_low_guitar_in_1",
        { a: misc.guitar_a },
        {
          f: startPlayingGuitar,
        },
        "animpoint_sit_low_guitar_in_2",
      ]
    ),
    out: createSequence(
      ["animpoint_sit_low_guitar_out_1", { d: misc.guitar_a }, "animpoint_sit_low_guitar_out_2"],
      ["animpoint_sit_low_guitar_out_1", { d: misc.guitar_a }, "animpoint_sit_low_guitar_out_2"]
    ),
    idle: createSequence("animpoint_sit_low_guitar_idle_1", "animpoint_sit_low_guitar_idle_1"),
    rnd: createSequence(["animpoint_sit_low_guitar_idle_rnd_2"], ["animpoint_sit_low_guitar_idle_rnd_2"]),
  },
  [EStalkerState.ANIMPOINT_SIT_ASS_GUITAR]: {
    prop: {
      maxidle: 3,
      sumidle: 3,
      rnd: 80,
      moving: null,
    },
    into: createSequence(
      [
        "sit_1_guitar_0_0",
        { a: misc.guitar_a },
        {
          f: startPlayingGuitar,
        },
        "sit_1_guitar_0_1",
      ],
      [
        "sit_1_guitar_0_0",
        { a: misc.guitar_a },
        {
          f: startPlayingGuitar,
        },
        "sit_1_guitar_0_1",
      ]
    ),
    out: createSequence(
      ["guitar_0_sit_1_0", { d: misc.guitar_a }, "guitar_0_sit_1_1"],
      ["guitar_0_sit_1_0", { d: misc.guitar_a }, "guitar_0_sit_1_1"]
    ),
    idle: createSequence("guitar_0", "guitar_0"),
    rnd: null,
  },
  [EStalkerState.ANIMPOINT_SIT_KNEE_GUITAR]: {
    prop: {
      maxidle: 3,
      sumidle: 3,
      rnd: 80,
      moving: null,
    },
    into: createSequence(
      [
        "sit_1_guitar_0_0",
        { a: misc.guitar_a },
        {
          f: startPlayingGuitar,
        },
        "sit_1_guitar_0_1",
      ],
      [
        "sit_1_guitar_0_0",
        { a: misc.guitar_a },
        {
          f: startPlayingGuitar,
        },
        "sit_1_guitar_0_1",
      ]
    ),
    out: createSequence(
      ["guitar_0_sit_1_0", { d: misc.guitar_a }, "guitar_0_sit_1_1"],
      ["guitar_0_sit_1_0", { d: misc.guitar_a }, "guitar_0_sit_1_1"]
    ),
    idle: createSequence("guitar_0", "guitar_0"),
    rnd: null,
  },
  [EStalkerState.ANIMPOINT_STAY_WALL_HARMONICA]: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80,
      moving: true,
    },
    into: null,
    out: null,
    idle: createSequence("idle_0_idle_1", "idle_0_idle_1"),
    rnd: createSequence(["idle_0_idle_0"], ["idle_0_idle_0"]),
  },
  [EStalkerState.ANIMPOINT_STAY_TABLE_HARMONICA]: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80,
      moving: true,
    },
    into: null,
    out: null,
    idle: createSequence("idle_0_idle_1", "idle_0_idle_1"),
    rnd: createSequence(["idle_0_idle_0"], ["idle_0_idle_0"]),
  },
  [EStalkerState.ANIMPOINT_SIT_HIGH_HARMONICA]: {
    prop: {
      maxidle: 0,
      sumidle: 0,
      rnd: 100,
      moving: true,
    },
    into: createSequence(
      [
        "animpoint_sit_high_harmonica_in_1",
        { a: misc.harmonica_a },
        {
          f: startPlayingHarmonica,
        },
        "animpoint_sit_high_harmonica_in_2",
      ],
      [
        "animpoint_sit_high_harmonica_in_1",
        { a: misc.harmonica_a },
        {
          f: startPlayingHarmonica,
        },
        "animpoint_sit_high_harmonica_in_2",
      ]
    ),
    out: createSequence(
      ["animpoint_sit_high_harmonica_out_1", { d: misc.harmonica_a }, "animpoint_sit_high_harmonica_out_2"],
      ["animpoint_sit_high_harmonica_out_1", { d: misc.harmonica_a }, "animpoint_sit_high_harmonica_out_2"]
    ),
    idle: createSequence("animpoint_sit_high_harmonica_idle_1", "animpoint_sit_high_harmonica_idle_1"),
    rnd: null,
  },
  [EStalkerState.ANIMPOINT_SIT_NORMAL_HARMONICA]: {
    prop: {
      maxidle: 1,
      sumidle: 0,
      rnd: 100,
      moving: true,
    },
    into: null,
    out: null,
    idle: createSequence("idle_0_idle_1", "idle_0_idle_1"),
    rnd: createSequence(["idle_0_idle_0"], ["idle_0_idle_0"]),
  },
  [EStalkerState.ANIMPOINT_SIT_LOW_HARMONICA]: {
    prop: {
      maxidle: 0,
      sumidle: 0,
      rnd: 100,
      moving: true,
    },
    into: createSequence(
      [
        "animpoint_sit_low_harmonica_in_1",
        { a: misc.harmonica_a },
        {
          f: startPlayingHarmonica,
        },
        "animpoint_sit_low_harmonica_in_2",
      ],
      [
        "animpoint_sit_low_harmonica_in_1",
        { a: misc.harmonica_a },
        {
          f: startPlayingHarmonica,
        },
        "animpoint_sit_low_harmonica_in_2",
      ]
    ),
    out: createSequence(
      ["animpoint_sit_low_harmonica_out_1", { d: misc.harmonica_a }, "animpoint_sit_low_harmonica_out_2"],
      ["animpoint_sit_low_harmonica_out_1", { d: misc.harmonica_a }, "animpoint_sit_low_harmonica_out_2"]
    ),
    idle: createSequence("animpoint_sit_low_harmonica_idle_1", "animpoint_sit_low_harmonica_idle_1"),
    rnd: null,
  },
  [EStalkerState.ANIMPOINT_SIT_ASS_HARMONICA]: {
    prop: {
      maxidle: 3,
      sumidle: 3,
      rnd: 80,
      moving: null,
    },
    into: createSequence(
      [
        "sit_2_harmonica_1_0",
        { a: misc.harmonica_a },
        {
          f: startPlayingHarmonica,
        },
        "sit_2_harmonica_1_1",
      ],
      [
        "sit_2_harmonica_1_0",
        { a: misc.harmonica_a },
        {
          f: startPlayingHarmonica,
        },
        "sit_2_harmonica_1_1",
      ]
    ),
    out: createSequence(
      ["harmonica_1_sit_2_0", { d: misc.harmonica_a }, "harmonica_1_sit_2_1"],
      ["harmonica_1_sit_2_0", { d: misc.harmonica_a }, "harmonica_1_sit_2_1"]
    ),
    idle: createSequence("harmonica_0", "harmonica_0"),
    rnd: null,
  },
  [EStalkerState.ANIMPOINT_SIT_KNEE_HARMONICA]: {
    prop: {
      maxidle: 3,
      sumidle: 3,
      rnd: 80,
      moving: null,
    },
    into: createSequence(
      [
        "sit_2_harmonica_1_0",
        { a: misc.harmonica_a },
        {
          f: startPlayingHarmonica,
        },
        "sit_2_harmonica_1_1",
      ],
      [
        "sit_2_harmonica_1_0",
        { a: misc.harmonica_a },
        {
          f: startPlayingHarmonica,
        },
        "sit_2_harmonica_1_1",
      ]
    ),
    out: createSequence(
      ["harmonica_1_sit_2_0", { d: misc.harmonica_a }, "harmonica_1_sit_2_1"],
      ["harmonica_1_sit_2_0", { d: misc.harmonica_a }, "harmonica_1_sit_2_1"]
    ),
    idle: createSequence("harmonica_0", "harmonica_0"),
    rnd: null,
  },
});
