import { CampManager } from "@/engine/core/objects/state/camp";
import { IAnimationDescriptor } from "@/engine/core/objects/state/state_types";
import { ClientObject, TName } from "@/engine/lib/types";

/**
 * List of animpoint animations.
 */
export const animpointAnimations: LuaTable<TName, IAnimationDescriptor> = {
  animpoint_stay_wall: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80,
      moving: true,
    },
    into: null,
    out: null,
    idle: {
      [0]: "animpoint_stay_wall_idle_1",
      [1]: "animpoint_stay_wall_idle_1",
    },
    rnd: {
      [0]: [
        "animpoint_stay_wall_idle_rnd_1",
        "animpoint_stay_wall_idle_rnd_2",
        "animpoint_stay_wall_idle_rnd_3",
        "animpoint_stay_wall_idle_rnd_4",
      ],
      [1]: [
        "animpoint_stay_wall_idle_rnd_1",
        "animpoint_stay_wall_idle_rnd_2",
        "animpoint_stay_wall_idle_rnd_3",
        "animpoint_stay_wall_idle_rnd_4",
      ],
    },
  },
  animpoint_stay_table: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80,
      moving: true,
    },
    into: null,
    out: null,
    idle: {
      [0]: "animpoint_stay_table_idle_1",
      [1]: "animpoint_stay_table_idle_1",
    },
    rnd: {
      [0]: [
        "animpoint_stay_table_idle_rnd_1",
        "animpoint_stay_table_idle_rnd_2",
        "animpoint_stay_table_idle_rnd_3",
        "animpoint_stay_table_idle_rnd_4",
        "animpoint_stay_table_idle_rnd_5",
      ],
      [1]: [
        "animpoint_stay_table_idle_rnd_1",
        "animpoint_stay_table_idle_rnd_2",
        "animpoint_stay_table_idle_rnd_3",
        "animpoint_stay_table_idle_rnd_4",
        "animpoint_stay_table_idle_rnd_5",
      ],
    },
  },

  animpoint_sit_high: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80,
      moving: true,
    },
    into: null,
    out: null,
    idle: {
      [0]: "animpoint_sit_high_idle_1",
      [1]: "animpoint_sit_high_idle_1",
    },
    rnd: {
      [0]: [
        "animpoint_sit_high_idle_rnd_1",
        "animpoint_sit_high_idle_rnd_2",
        "animpoint_sit_high_idle_rnd_3",
        "animpoint_sit_high_idle_rnd_4",
      ],
      [1]: [
        "animpoint_sit_high_idle_rnd_1",
        "animpoint_sit_high_idle_rnd_2",
        "animpoint_sit_high_idle_rnd_3",
        "animpoint_sit_high_idle_rnd_4",
      ],
    },
  },

  animpoint_sit_normal: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80,
      moving: true,
    },
    into: null,
    out: null,
    idle: {
      [0]: "animpoint_sit_normal_idle_1",
      [1]: "animpoint_sit_normal_idle_1",
    },
    rnd: {
      [0]: [
        "animpoint_sit_normal_idle_rnd_1",
        "animpoint_sit_normal_idle_rnd_2",
        "animpoint_sit_normal_idle_rnd_3",
        "animpoint_sit_normal_idle_rnd_4",
      ],
      [1]: [
        "animpoint_sit_normal_idle_rnd_1",
        "animpoint_sit_normal_idle_rnd_2",
        "animpoint_sit_normal_idle_rnd_3",
        "animpoint_sit_normal_idle_rnd_4",
      ],
    },
  },

  animpoint_sit_low: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80,
      moving: true,
    },
    into: null,
    out: null,
    idle: {
      [0]: "animpoint_sit_low_idle_1",
      [1]: "animpoint_sit_low_idle_1",
    },
    rnd: {
      [0]: [
        "animpoint_sit_low_idle_rnd_1",
        "animpoint_sit_low_idle_rnd_2",
        "animpoint_sit_low_idle_rnd_3",
        "animpoint_sit_low_idle_rnd_4",
      ],
      [1]: [
        "animpoint_sit_low_idle_rnd_1",
        "animpoint_sit_low_idle_rnd_2",
        "animpoint_sit_low_idle_rnd_3",
        "animpoint_sit_low_idle_rnd_4",
      ],
    },
  },
  animpoint_sit_ass: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80,
      moving: true,
    },
    into: null,
    out: null,
    idle: {
      [0]: "sit_2_idle_0",
      [1]: "sit_2_idle_0",
    },
    rnd: {
      [0]: ["sit_2_idle_1", "sit_2_idle_2", "sit_2_idle_3"],
      [1]: ["sit_2_idle_1", "sit_2_idle_2", "sit_2_idle_3"],
    },
  },
  animpoint_sit_knee: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80,
      moving: true,
    },
    into: null,
    out: null,
    idle: {
      [0]: "sit_1_idle_0",
      [1]: "sit_1_idle_0",
    },
    rnd: {
      [0]: ["sit_1_idle_1", "sit_1_idle_2", "sit_1_idle_3"],
      [1]: ["sit_1_idle_1", "sit_1_idle_2", "sit_1_idle_3"],
    },
  },
  animpoint_stay_wall_eat_bread: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80,
      moving: true,
    },
    into: {
      [0]: ["animpoint_stay_wall_eat_in_1", { a: "bread" }, "animpoint_stay_wall_eat_in_2"],
      [1]: ["animpoint_stay_wall_eat_in_1", { a: "bread" }, "animpoint_stay_wall_eat_in_2"],
    },
    out: {
      [0]: ["animpoint_stay_wall_eat_out_1", { d: "bread" }, "animpoint_stay_wall_eat_out_2"],
      [1]: ["animpoint_stay_wall_eat_out_1", { d: "bread" }, "animpoint_stay_wall_eat_out_2"],
    },
    idle: {
      [0]: "animpoint_stay_wall_eat_idle_1",
      [1]: "animpoint_stay_wall_eat_idle_1",
    },
    rnd: {
      [0]: ["animpoint_stay_wall_eat_idle_rnd_1", "animpoint_stay_wall_eat_idle_rnd_2"],
      [1]: ["animpoint_stay_wall_eat_idle_rnd_1", "animpoint_stay_wall_eat_idle_rnd_2"],
    },
  },
  animpoint_stay_wall_eat_kolbasa: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80,
      moving: true,
    },
    into: {
      [0]: ["animpoint_stay_wall_eat_in_1", { a: "kolbasa" }, "animpoint_stay_wall_eat_in_2"],
      [1]: ["animpoint_stay_wall_eat_in_1", { a: "kolbasa" }, "animpoint_stay_wall_eat_in_2"],
    },
    out: {
      [0]: ["animpoint_stay_wall_eat_out_1", { d: "kolbasa" }, "animpoint_stay_wall_eat_out_2"],
      [1]: ["animpoint_stay_wall_eat_out_1", { d: "kolbasa" }, "animpoint_stay_wall_eat_out_2"],
    },
    idle: {
      [0]: "animpoint_stay_wall_eat_idle_1",
      [1]: "animpoint_stay_wall_eat_idle_1",
    },
    rnd: {
      [0]: ["animpoint_stay_wall_eat_idle_rnd_1"],
      [1]: ["animpoint_stay_wall_eat_idle_rnd_1"],
    },
  },

  animpoint_stay_table_eat_bread: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80,
      moving: true,
    },
    into: null,
    out: null,
    idle: {
      [0]: "animpoint_stay_table_idle_1",
      [1]: "animpoint_stay_table_idle_1",
    },
    rnd: {
      [0]: ["animpoint_stay_table_idle_1"],
      [1]: ["animpoint_stay_table_idle_1"],
    },
  },

  animpoint_stay_table_eat_kolbasa: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80,
      moving: true,
    },
    into: null,
    out: null,
    idle: {
      [0]: "animpoint_stay_table_idle_1",
      [1]: "animpoint_stay_table_idle_1",
    },
    rnd: {
      [0]: ["animpoint_stay_table_idle_1"],
      [1]: ["animpoint_stay_table_idle_1"],
    },
  },

  animpoint_sit_high_eat_bread: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80,
      moving: true,
    },
    into: {
      [0]: ["animpoint_sit_high_eat_in_1", { a: "bread" }, "animpoint_sit_high_eat_in_2"],
      [1]: ["animpoint_sit_high_eat_in_1", { a: "bread" }, "animpoint_sit_high_eat_in_2"],
    },
    out: {
      [0]: ["animpoint_sit_high_eat_out_1", { d: "bread" }, "animpoint_sit_high_eat_out_2"],
      [1]: ["animpoint_sit_high_eat_out_1", { d: "bread" }, "animpoint_sit_high_eat_out_2"],
    },
    idle: {
      [0]: "animpoint_sit_high_eat_idle_1",
      [1]: "animpoint_sit_high_eat_idle_1",
    },
    rnd: {
      [0]: ["animpoint_sit_high_eat_idle_rnd_1", "animpoint_sit_high_eat_idle_rnd_2"],
      [1]: ["animpoint_sit_high_eat_idle_rnd_1", "animpoint_sit_high_eat_idle_rnd_2"],
    },
  },

  animpoint_sit_high_eat_kolbasa: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80,
      moving: true,
    },
    into: {
      [0]: ["animpoint_sit_high_eat_in_1", { a: "kolbasa" }, "animpoint_sit_high_eat_in_2"],
      [1]: ["animpoint_sit_high_eat_in_1", { a: "kolbasa" }, "animpoint_sit_high_eat_in_2"],
    },
    out: {
      [0]: ["animpoint_sit_high_eat_out_1", { d: "kolbasa" }, "animpoint_sit_high_eat_out_2"],
      [1]: ["animpoint_sit_high_eat_out_1", { d: "kolbasa" }, "animpoint_sit_high_eat_out_2"],
    },
    idle: {
      [0]: "animpoint_sit_high_eat_idle_1",
      [1]: "animpoint_sit_high_eat_idle_1",
    },
    rnd: {
      [0]: ["animpoint_sit_high_eat_idle_rnd_1"],
      [1]: ["animpoint_sit_high_eat_idle_rnd_1"],
    },
  },

  animpoint_sit_normal_eat_bread: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80,
      moving: true,
    },
    into: {
      [0]: ["animpoint_sit_normal_eat_in_1", { a: "bread" }, "animpoint_sit_normal_eat_in_2"],
      [1]: ["animpoint_sit_normal_eat_in_1", { a: "bread" }, "animpoint_sit_normal_eat_in_2"],
    },
    out: {
      [0]: ["animpoint_sit_normal_eat_out_1", { d: "bread" }, "animpoint_sit_normal_eat_out_2"],
      [1]: ["animpoint_sit_normal_eat_out_1", { d: "bread" }, "animpoint_sit_normal_eat_out_2"],
    },
    idle: {
      [0]: "animpoint_sit_normal_eat_idle_1",
      [1]: "animpoint_sit_normal_eat_idle_1",
    },
    rnd: {
      [0]: ["animpoint_sit_normal_eat_idle_rnd_1", "animpoint_sit_normal_eat_idle_rnd_2"],
      [1]: ["animpoint_sit_normal_eat_idle_rnd_1", "animpoint_sit_normal_eat_idle_rnd_2"],
    },
  },
  animpoint_sit_normal_eat_kolbasa: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80,
      moving: true,
    },
    into: {
      [0]: ["animpoint_sit_normal_eat_in_1", { a: "kolbasa" }, "animpoint_sit_normal_eat_in_2"],
      [1]: ["animpoint_sit_normal_eat_in_1", { a: "kolbasa" }, "animpoint_sit_normal_eat_in_2"],
    },
    out: {
      [0]: ["animpoint_sit_normal_eat_out_1", { d: "kolbasa" }, "animpoint_sit_normal_eat_out_2"],
      [1]: ["animpoint_sit_normal_eat_out_1", { d: "kolbasa" }, "animpoint_sit_normal_eat_out_2"],
    },
    idle: {
      [0]: "animpoint_sit_normal_eat_idle_1",
      [1]: "animpoint_sit_normal_eat_idle_1",
    },
    rnd: {
      [0]: ["animpoint_sit_normal_eat_idle_1"],
      [1]: ["animpoint_sit_normal_eat_idle_1"],
    },
  },
  animpoint_sit_low_eat_bread: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80,
      moving: true,
    },
    into: {
      [0]: ["animpoint_sit_low_eat_in_1", { a: "bread" }, "animpoint_sit_low_eat_in_2"],
      [1]: ["animpoint_sit_low_eat_in_1", { a: "bread" }, "animpoint_sit_low_eat_in_2"],
    },
    out: {
      [0]: ["animpoint_sit_low_eat_out_1", { d: "bread" }, "animpoint_sit_low_eat_out_2"],
      [1]: ["animpoint_sit_low_eat_out_1", { d: "bread" }, "animpoint_sit_low_eat_out_2"],
    },
    idle: {
      [0]: "animpoint_sit_low_eat_idle_1",
      [1]: "animpoint_sit_low_eat_idle_1",
    },
    rnd: {
      [0]: ["animpoint_sit_low_eat_idle_1", "animpoint_sit_low_eat_idle_2"],
      [1]: ["animpoint_sit_low_eat_idle_1", "animpoint_sit_low_eat_idle_2"],
    },
  },
  animpoint_sit_low_eat_kolbasa: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80,
      moving: true,
    },
    into: {
      [0]: ["animpoint_sit_low_eat_in_1", { a: "kolbasa" }, "animpoint_sit_low_eat_in_2"],
      [1]: ["animpoint_sit_low_eat_in_1", { a: "kolbasa" }, "animpoint_sit_low_eat_in_2"],
    },
    out: {
      [0]: ["animpoint_sit_low_eat_out_1", { d: "kolbasa" }, "animpoint_sit_low_eat_out_2"],
      [1]: ["animpoint_sit_low_eat_out_1", { d: "kolbasa" }, "animpoint_sit_low_eat_out_2"],
    },
    idle: {
      [0]: "animpoint_sit_low_eat_idle_1",
      [1]: "animpoint_sit_low_eat_idle_1",
    },
    rnd: {
      [0]: ["animpoint_sit_low_eat_idle_1"],
      [1]: ["animpoint_sit_low_eat_idle_1"],
    },
  },

  animpoint_stay_wall_drink_vodka: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80,
      moving: true,
    },
    into: {
      [0]: ["animpoint_stay_wall_drink_in_1", { a: "vodka" }, "animpoint_stay_wall_drink_in_2"],
      [1]: ["animpoint_stay_wall_drink_in_1", { a: "vodka" }, "animpoint_stay_wall_drink_in_2"],
    },
    out: {
      [0]: ["animpoint_stay_wall_drink_out_1", { d: "vodka" }, "animpoint_stay_wall_drink_out_2"],
      [1]: ["animpoint_stay_wall_drink_out_1", { d: "vodka" }, "animpoint_stay_wall_drink_out_2"],
    },
    idle: {
      [0]: "animpoint_stay_wall_drink_idle_1",
      [1]: "animpoint_stay_wall_drink_idle_1",
    },
    rnd: {
      [0]: ["animpoint_stay_wall_drink_idle_rnd_1", "animpoint_stay_wall_drink_idle_rnd_2"],
      [1]: ["animpoint_stay_wall_drink_idle_rnd_1", "animpoint_stay_wall_drink_idle_rnd_2"],
    },
  },

  animpoint_stay_wall_drink_energy: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80,
      moving: true,
    },
    into: {
      [0]: ["animpoint_stay_wall_drink_in_1", { a: "energy_drink" }, "animpoint_stay_wall_drink_in_2"],
      [1]: ["animpoint_stay_wall_drink_in_1", { a: "energy_drink" }, "animpoint_stay_wall_drink_in_2"],
    },
    out: {
      [0]: ["animpoint_stay_wall_drink_out_1", { d: "energy_drink" }, "animpoint_stay_wall_drink_out_2"],
      [1]: ["animpoint_stay_wall_drink_out_1", { d: "energy_drink" }, "animpoint_stay_wall_drink_out_2"],
    },
    idle: {
      [0]: "animpoint_stay_wall_drink_idle_1",
      [1]: "animpoint_stay_wall_drink_idle_1",
    },
    rnd: {
      [0]: ["animpoint_stay_wall_drink_idle_1"],
      [1]: ["animpoint_stay_wall_drink_idle_1"],
    },
  },

  animpoint_stay_table_drink_vodka: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80,
      moving: true,
    },
    into: null,
    out: null,
    idle: {
      [0]: "animpoint_stay_table_idle_1",
      [1]: "animpoint_stay_table_idle_1",
    },
    rnd: {
      [0]: ["animpoint_stay_table_idle_1"],
      [1]: ["animpoint_stay_table_idle_1"],
    },
  },
  animpoint_stay_table_drink_energy: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80,
      moving: true,
    },
    into: null,
    out: null,
    idle: {
      [0]: "animpoint_stay_table_idle_1",
      [1]: "animpoint_stay_table_idle_1",
    },
    rnd: {
      [0]: ["animpoint_stay_table_idle_1"],
      [1]: ["animpoint_stay_table_idle_1"],
    },
  },

  animpoint_sit_high_drink_vodka: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80,
      moving: true,
    },
    into: {
      [0]: ["animpoint_sit_high_drink_in_1", { a: "vodka" }, "animpoint_sit_high_drink_in_2"],
      [1]: ["animpoint_sit_high_drink_in_1", { a: "vodka" }, "animpoint_sit_high_drink_in_2"],
    },
    out: {
      [0]: ["animpoint_sit_high_drink_out_1", { d: "vodka" }, "animpoint_sit_high_drink_out_2"],
      [1]: ["animpoint_sit_high_drink_out_1", { d: "vodka" }, "animpoint_sit_high_drink_out_2"],
    },
    idle: {
      [0]: "animpoint_sit_high_drink_idle_1",
      [1]: "animpoint_sit_high_drink_idle_1",
    },
    rnd: {
      [0]: ["animpoint_sit_high_drink_idle_rnd_1", "animpoint_sit_high_drink_idle_rnd_2"],
      [1]: ["animpoint_sit_high_drink_idle_rnd_1", "animpoint_sit_high_drink_idle_rnd_2"],
    },
  },

  animpoint_sit_high_drink_energy: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80,
      moving: true,
    },
    into: {
      [0]: ["animpoint_sit_high_drink_in_1", { a: "energy_drink" }, "animpoint_sit_high_drink_in_2"],
      [1]: ["animpoint_sit_high_drink_in_1", { a: "energy_drink" }, "animpoint_sit_high_drink_in_2"],
    },
    out: {
      [0]: ["animpoint_sit_high_drink_out_1", { d: "energy_drink" }, "animpoint_sit_high_drink_out_2"],
      [1]: ["animpoint_sit_high_drink_out_1", { d: "energy_drink" }, "animpoint_sit_high_drink_out_2"],
    },
    idle: {
      [0]: "animpoint_sit_high_drink_idle_1",
      [1]: "animpoint_sit_high_drink_idle_1",
    },
    rnd: {
      [0]: ["animpoint_sit_high_drink_idle_rnd_1"],
      [1]: ["animpoint_sit_high_drink_idle_rnd_1"],
    },
  },

  animpoint_sit_normal_drink_vodka: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80,
      moving: true,
    },
    into: {
      [0]: ["animpoint_sit_normal_drink_in_1", { a: "vodka" }, "animpoint_sit_normal_drink_in_2"],
      [1]: ["animpoint_sit_normal_drink_in_1", { a: "vodka" }, "animpoint_sit_normal_drink_in_2"],
    },
    out: {
      [0]: ["animpoint_sit_normal_drink_out_1", { d: "vodka" }, "animpoint_sit_normal_drink_out_2"],
      [1]: ["animpoint_sit_normal_drink_out_1", { d: "vodka" }, "animpoint_sit_normal_drink_out_2"],
    },
    idle: {
      [0]: "animpoint_sit_normal_drink_idle_1",
      [1]: "animpoint_sit_normal_drink_idle_1",
    },
    rnd: {
      [0]: ["animpoint_sit_normal_drink_idle_rnd_1", "animpoint_sit_normal_drink_idle_rnd_2"],
      [1]: ["animpoint_sit_normal_drink_idle_rnd_1", "animpoint_sit_normal_drink_idle_rnd_2"],
    },
  },
  animpoint_sit_normal_drink_energy: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80,
      moving: true,
    },
    into: {
      [0]: ["animpoint_sit_normal_drink_in_1", { a: "energy_drink" }, "animpoint_sit_normal_drink_in_2"],
      [1]: ["animpoint_sit_normal_drink_in_1", { a: "energy_drink" }, "animpoint_sit_normal_drink_in_2"],
    },
    out: {
      [0]: ["animpoint_sit_normal_drink_out_1", { d: "energy_drink" }, "animpoint_sit_normal_drink_out_2"],
      [1]: ["animpoint_sit_normal_drink_out_1", { d: "energy_drink" }, "animpoint_sit_normal_drink_out_2"],
    },
    idle: {
      [0]: "animpoint_sit_normal_drink_idle_1",
      [1]: "animpoint_sit_normal_drink_idle_1",
    },
    rnd: {
      [0]: ["animpoint_sit_normal_drink_idle_1"],
      [1]: ["animpoint_sit_normal_drink_idle_1"],
    },
  },

  animpoint_sit_low_drink_vodka: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80,
      moving: true,
    },
    into: {
      [0]: ["animpoint_sit_low_drink_in_1", { a: "vodka" }, "animpoint_sit_low_drink_in_2"],
      [1]: ["animpoint_sit_low_drink_in_1", { a: "vodka" }, "animpoint_sit_low_drink_in_2"],
    },
    out: {
      [0]: ["animpoint_sit_low_drink_out_1", { d: "vodka" }, "animpoint_sit_low_drink_out_2"],
      [1]: ["animpoint_sit_low_drink_out_1", { d: "vodka" }, "animpoint_sit_low_drink_out_2"],
    },
    idle: {
      [0]: "animpoint_sit_low_drink_idle_1",
      [1]: "animpoint_sit_low_drink_idle_1",
    },
    rnd: {
      [0]: ["animpoint_sit_low_drink_idle_rnd_1", "animpoint_sit_low_drink_idle_rnd_2"],
      [1]: ["animpoint_sit_low_drink_idle_rnd_1", "animpoint_sit_low_drink_idle_rnd_2"],
    },
  },
  animpoint_sit_low_drink_energy: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80,
      moving: true,
    },
    into: {
      [0]: ["animpoint_sit_low_drink_in_1", { a: "energy_drink" }, "animpoint_sit_low_drink_in_2"],
      [1]: ["animpoint_sit_low_drink_in_1", { a: "energy_drink" }, "animpoint_sit_low_drink_in_2"],
    },
    out: {
      [0]: ["animpoint_sit_low_drink_out_1", { d: "energy_drink" }, "animpoint_sit_low_drink_out_2"],
      [1]: ["animpoint_sit_low_drink_out_1", { d: "energy_drink" }, "animpoint_sit_low_drink_out_2"],
    },
    idle: {
      [0]: "animpoint_sit_low_drink_idle_1",
      [1]: "animpoint_sit_low_drink_idle_1",
    },
    rnd: {
      [0]: ["animpoint_sit_low_drink_idle_rnd_1"],
      [1]: ["animpoint_sit_low_drink_idle_rnd_1"],
    },
  },

  animpoint_stay_wall_guitar: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80,
      moving: true,
    },
    into: null,
    out: null,
    idle: {
      [0]: "idle_0_idle_1",
      [1]: "idle_0_idle_1",
    },
    rnd: {
      [0]: ["idle_0_idle_0"],
      [1]: ["idle_0_idle_0"],
    },
  },

  animpoint_stay_table_guitar: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80,
      moving: true,
    },
    into: null,
    out: null,
    idle: {
      [0]: "idle_0_idle_1",
      [1]: "idle_0_idle_1",
    },
    rnd: {
      [0]: ["idle_0_idle_0"],
      [1]: ["idle_0_idle_0"],
    },
  },

  animpoint_sit_high_guitar: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80,
      moving: true,
    },
    into: null,
    out: null,
    idle: {
      [0]: "idle_0_idle_1",
      [1]: "idle_0_idle_1",
    },
    rnd: {
      [0]: ["idle_0_idle_0"],
      [1]: ["idle_0_idle_0"],
    },
  },

  animpoint_sit_normal_guitar: {
    prop: {
      maxidle: 0,
      sumidle: 0,
      rnd: 100,
      moving: true,
    },
    into: {
      [0]: [
        "animpoint_sit_normal_guitar_in_1",
        { a: "guitar_a" },
        {
          f: (object: ClientObject) => {
            CampManager.startPlayingGuitar(object);
          },
        },
        "animpoint_sit_normal_guitar_in_2",
      ],
      [1]: [
        "animpoint_sit_normal_guitar_in_1",
        { a: "guitar_a" },
        {
          f: (object: ClientObject) => {
            CampManager.startPlayingGuitar(object);
          },
        },
        "animpoint_sit_normal_guitar_in_2",
      ],
    },
    out: {
      [0]: ["animpoint_sit_normal_guitar_out_1", { d: "guitar_a" }, "animpoint_sit_normal_guitar_out_2"],
      [1]: ["animpoint_sit_normal_guitar_out_1", { d: "guitar_a" }, "animpoint_sit_normal_guitar_out_2"],
    },
    idle: {
      [0]: "animpoint_sit_normal_guitar_idle_1",
      [1]: "animpoint_sit_normal_guitar_idle_1",
    },
    rnd: {
      [0]: ["animpoint_sit_normal_guitar_idle_rnd_1"],
      [1]: ["animpoint_sit_normal_guitar_idle_rnd_1"],
    },
  },

  animpoint_sit_low_guitar: {
    prop: {
      maxidle: 0,
      sumidle: 0,
      rnd: 100,
      moving: true,
    },
    into: {
      [0]: [
        "animpoint_sit_low_guitar_in_1",
        { a: "guitar_a" },
        {
          f: (object: ClientObject) => {
            CampManager.startPlayingGuitar(object);
          },
        },
        "animpoint_sit_low_guitar_in_2",
      ],
      [1]: [
        "animpoint_sit_low_guitar_in_1",
        { a: "guitar_a" },
        {
          f: (object: ClientObject) => {
            CampManager.startPlayingGuitar(object);
          },
        },
        "animpoint_sit_low_guitar_in_2",
      ],
    },
    out: {
      [0]: ["animpoint_sit_low_guitar_out_1", { d: "guitar_a" }, "animpoint_sit_low_guitar_out_2"],
      [1]: ["animpoint_sit_low_guitar_out_1", { d: "guitar_a" }, "animpoint_sit_low_guitar_out_2"],
    },
    idle: {
      [0]: "animpoint_sit_low_guitar_idle_1",
      [1]: "animpoint_sit_low_guitar_idle_1",
    },
    rnd: {
      [0]: ["animpoint_sit_low_guitar_idle_rnd_2"],
      [1]: ["animpoint_sit_low_guitar_idle_rnd_2"],
    },
  },

  animpoint_sit_ass_guitar: {
    prop: {
      maxidle: 3,
      sumidle: 3,
      rnd: 80,
    },
    into: {
      [0]: [
        "sit_1_guitar_0_0",
        { a: "guitar_a" },
        {
          f: (object: ClientObject) => {
            CampManager.startPlayingGuitar(object);
          },
        },
        "sit_1_guitar_0_1",
      ],
      [1]: [
        "sit_1_guitar_0_0",
        { a: "guitar_a" },
        {
          f: (object: ClientObject) => {
            CampManager.startPlayingGuitar(object);
          },
        },
        "sit_1_guitar_0_1",
      ],
    },
    out: {
      [0]: ["guitar_0_sit_1_0", { d: "guitar_a" }, "guitar_0_sit_1_1"],
      [1]: ["guitar_0_sit_1_0", { d: "guitar_a" }, "guitar_0_sit_1_1"],
    },
    idle: {
      [0]: "guitar_0",
      [1]: "guitar_0",
    },
    rnd: null,
  },

  animpoint_stay_wall_harmonica: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80,
      moving: true,
    },
    into: null,
    out: null,
    idle: {
      [0]: "idle_0_idle_1",
      [1]: "idle_0_idle_1",
    },
    rnd: {
      [0]: ["idle_0_idle_0"],
      [1]: ["idle_0_idle_0"],
    },
  },

  animpoint_stay_table_harmonica: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80,
      moving: true,
    },
    into: null,
    out: null,
    idle: {
      [0]: "idle_0_idle_1",
      [1]: "idle_0_idle_1",
    },
    rnd: {
      [0]: ["idle_0_idle_0"],
      [1]: ["idle_0_idle_0"],
    },
  },

  animpoint_sit_high_harmonica: {
    prop: {
      maxidle: 0,
      sumidle: 0,
      rnd: 100,
      moving: true,
    },
    into: {
      [0]: [
        "animpoint_sit_high_harmonica_in_1",
        { a: "harmonica_a" },
        {
          f: (object: ClientObject) => {
            CampManager.startPlayingHarmonica(object);
          },
        },
        "animpoint_sit_high_harmonica_in_2",
      ],
      [1]: [
        "animpoint_sit_high_harmonica_in_1",
        { a: "harmonica_a" },
        {
          f: (object: ClientObject) => {
            CampManager.startPlayingHarmonica(object);
          },
        },
        "animpoint_sit_high_harmonica_in_2",
      ],
    },
    out: {
      [0]: ["animpoint_sit_high_harmonica_out_1", { d: "harmonica_a" }, "animpoint_sit_high_harmonica_out_2"],
      [1]: ["animpoint_sit_high_harmonica_out_1", { d: "harmonica_a" }, "animpoint_sit_high_harmonica_out_2"],
    },
    idle: {
      [0]: "animpoint_sit_high_harmonica_idle_1",
      [1]: "animpoint_sit_high_harmonica_idle_1",
    },
    rnd: null,
  },

  animpoint_sit_normal_harmonica: {
    prop: {
      maxidle: 1,
      sumidle: 0,
      rnd: 100,
      moving: true,
    },
    into: null,
    out: null,
    idle: {
      [0]: "idle_0_idle_1",
      [1]: "idle_0_idle_1",
    },
    rnd: {
      [0]: ["idle_0_idle_0"],
      [1]: ["idle_0_idle_0"],
    },
  },

  animpoint_sit_low_harmonica: {
    prop: {
      maxidle: 0,
      sumidle: 0,
      rnd: 100,
      moving: true,
    },
    into: {
      [0]: [
        "animpoint_sit_low_harmonica_in_1",
        { a: "harmonica_a" },
        {
          f: (object: ClientObject) => {
            CampManager.startPlayingHarmonica(object);
          },
        },
        "animpoint_sit_low_harmonica_in_2",
      ],
      [1]: [
        "animpoint_sit_low_harmonica_in_1",
        { a: "harmonica_a" },
        {
          f: (object: ClientObject) => {
            CampManager.startPlayingHarmonica(object);
          },
        },
        "animpoint_sit_low_harmonica_in_2",
      ],
    },
    out: {
      [0]: ["animpoint_sit_low_harmonica_out_1", { d: "harmonica_a" }, "animpoint_sit_low_harmonica_out_2"],
      [1]: ["animpoint_sit_low_harmonica_out_1", { d: "harmonica_a" }, "animpoint_sit_low_harmonica_out_2"],
    },
    idle: {
      [0]: "animpoint_sit_low_harmonica_idle_1",
      [1]: "animpoint_sit_low_harmonica_idle_1",
    },
    rnd: null,
  },
} as any;
