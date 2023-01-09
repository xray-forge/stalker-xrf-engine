import { AnyCallable, AnyCallablesModule, Optional } from "@/mod/lib/types";
import { add_animpoint_animation_list } from "@/mod/scripts/core/state_management/lib/state_mgr_animation_list_animpoint";
import { add_animation_list_pri_a15 } from "@/mod/scripts/core/state_management/lib/state_mgr_pri_a15";
import { add_animation_list_scenario } from "@/mod/scripts/core/state_management/lib/state_mgr_scenario";
import { copyTable } from "@/mod/scripts/utils/table";

export interface IAnimationDescriptor {
  prop: {
    maxidle: number;
    sumidle: number;
    rnd: number;
    moving: Optional<boolean>;
  };
  into: Optional<LuaTable<number, string | { a: string } | { f: AnyCallable }>>;
  out: Optional<LuaTable<number, string | { a: string } | { f: AnyCallable }>>;
  idle: Optional<LuaTable<number, string | { a: string } | { f: AnyCallable }>>;
  rnd: Optional<LuaTable<number, LuaTable<number, string>>>;
}

export const animations: LuaTable<string, IAnimationDescriptor> = {
  idle: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80
    },
    into: null,
    out: null,
    idle: {
      [0]: "idle_0_idle_1",
      [1]: "idle_1_idle_1",
      [2]: "idle_2_idle_1",
      [3]: "idle_3_idle_1",
      [4]: "idle_4_idle_1",
      [8]: "idle_8_idle_1",
      [9]: "idle_2_idle_1",
      [10]: "idle_10_idle_1"
    },
    rnd: {
      [0]: ["idle_0_idle_0", "idle_0_idle_2", "idle_0_idle_3", "idle_0_idle_4"],
      [1]: ["idle_1_idle_0", "idle_1_idle_2", "idle_1_idle_3", "idle_1_idle_4"],
      [2]: ["idle_2_idle_0", "idle_2_idle_2", "idle_2_idle_3", "idle_2_idle_4"],
      [3]: ["idle_3_idle_0", "idle_3_idle_2", "idle_3_idle_3", "idle_3_idle_4"],
      [4]: ["idle_4_idle_0", "idle_4_idle_2", "idle_4_idle_3", "idle_4_idle_4"],
      [8]: ["idle_8_idle_0", "idle_8_idle_2", "idle_8_idle_3", "idle_8_idle_4"],
      [9]: ["idle_2_idle_0", "idle_2_idle_2", "idle_2_idle_3", "idle_2_idle_4"],
      [10]: ["idle_10_idle_0", "idle_10_idle_2", "idle_10_idle_3", "idle_10_idle_4"]
    }
  },
  idle_chasovoy: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80
    },
    into: null,
    out: null,
    idle: {
      [0]: "idle_0_idle_1",
      [1]: "idle_1_idle_1",
      [2]: "idle_2_idle_1",
      [3]: "idle_3_idle_1",
      [4]: "idle_4_idle_1",
      [8]: "idle_8_idle_1",
      [9]: "idle_2_idle_1",
      [10]: "idle_10_idle_1"
    },
    rnd: {
      [0]: ["chasovoy_0", "chasovoy_1", "chasovoy_2", "chasovoy_3", "chasovoy_4"],
      [1]: ["chasovoy_0", "chasovoy_1", "chasovoy_2", "chasovoy_3", "chasovoy_4"],
      [2]: ["chasovoy_0", "chasovoy_1", "chasovoy_2", "chasovoy_3", "chasovoy_4"],
      [3]: ["chasovoy_0", "chasovoy_1", "chasovoy_2", "chasovoy_3", "chasovoy_4"],
      [4]: ["chasovoy_0", "chasovoy_1", "chasovoy_2", "chasovoy_3", "chasovoy_4"],
      [8]: ["chasovoy_0", "chasovoy_1", "chasovoy_2", "chasovoy_3", "chasovoy_4"],
      [9]: ["chasovoy_0", "chasovoy_1", "chasovoy_2", "chasovoy_3", "chasovoy_4"],
      [10]: ["chasovoy_0", "chasovoy_1", "chasovoy_2", "chasovoy_3", "chasovoy_4"]
    }
  },
  caution: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80
    },
    into: {
      [0]: ["prisluh_0_in"],
      [1]: ["prisluh_1_in"],
      [2]: ["prisluh_2_in"],
      [3]: ["prisluh_3_in"],
      [4]: ["prisluh_4_in"],
      [8]: ["prisluh_8_in"],
      [9]: ["prisluh_9_in"],
      [10]: ["prisluh_10_in"]
    },
    out: {
      [0]: ["prisluh_0_out"],
      [1]: ["prisluh_1_out"],
      [2]: ["prisluh_2_out"],
      [3]: ["prisluh_3_out"],
      [4]: ["prisluh_4_out"],
      [8]: ["prisluh_8_out"],
      [9]: ["prisluh_9_out"],
      [10]: ["prisluh_10_out"]
    },
    idle: {
      [0]: "prisluh_0_1",
      [1]: "prisluh_1_1",
      [2]: "prisluh_2_1",
      [3]: "prisluh_3_1",
      [4]: "prisluh_4_1",
      [8]: "prisluh_8_1",
      [9]: "prisluh_9_1",
      [10]: "prisluh_10_1"
    },
    rnd: {
      [0]: ["prisluh_0_0", "prisluh_0_2"],
      [1]: ["prisluh_1_0", "prisluh_1_2"],
      [2]: ["prisluh_2_0", "prisluh_2_2"],
      [3]: ["prisluh_3_0", "prisluh_3_2"],
      [4]: ["prisluh_4_0", "prisluh_4_2"],
      [8]: ["prisluh_8_0", "prisluh_8_2"],
      [9]: ["prisluh_9_0", "prisluh_9_2"],
      [10]: ["prisluh_10_0", "prisluh_10_2"]
    }
  },
  poisk: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80
    },
    into: null,
    out: null,
    idle: {
      [0]: "poisk_0_idle_1",
      [1]: "poisk_1_idle_1",
      [2]: "poisk_2_idle_1",
      [3]: "poisk_3_idle_1",
      [4]: "poisk_4_idle_1",
      [8]: "poisk_8_idle_1",
      [9]: "poisk_9_idle_1",
      [10]: "poisk_10_idle_1"
    },
    rnd: {
      [0]: ["poisk_0_idle_0", "poisk_0_idle_2"],
      [1]: ["poisk_1_idle_0", "poisk_1_idle_2"],
      [2]: ["poisk_2_idle_0", "poisk_2_idle_2"],
      [3]: ["poisk_3_idle_0", "poisk_3_idle_2"],
      [4]: ["poisk_4_idle_0", "poisk_4_idle_2"],
      [8]: ["poisk_8_idle_0", "poisk_8_idle_2"],
      [9]: ["poisk_9_idle_0", "poisk_9_idle_2"],
      [10]: ["poisk_10_idle_0", "poisk_10_idle_2"]
    }
  },
  stoop_no_weap: {
    prop: {
      maxidle: 2,
      sumidle: 1,
      rnd: 80
    },
    into: null,
    out: null,
    idle: { [0]: "poisk_0_idle_0" },
    rnd: null
  },
  hide: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80
    },
    into: {
      [0]: ["cr_idle_0_in"],
      [1]: ["cr_idle_1_in"],
      [2]: ["cr_idle_2_in"],
      [3]: ["cr_idle_3_in"],
      [4]: ["cr_idle_4_in"],
      [8]: ["cr_idle_8_in"],
      [9]: ["cr_idle_9_in"],
      [10]: ["cr_idle_10_in"]
    },
    out: {
      [0]: ["cr_idle_0_out"],
      [1]: ["cr_idle_1_out"],
      [2]: ["cr_idle_2_out"],
      [3]: ["cr_idle_3_out"],
      [4]: ["cr_idle_4_out"],
      [8]: ["cr_idle_8_out"],
      [9]: ["cr_idle_9_out"],
      [10]: ["cr_idle_10_out"]
    },
    idle: {
      [0]: "cr_idle_0_1",
      [1]: "cr_idle_1_1",
      [2]: "cr_idle_2_1",
      [3]: "cr_idle_3_1",
      [4]: "cr_idle_4_1",
      [8]: "cr_idle_8_1",
      [9]: "cr_idle_9_1",
      [10]: "cr_idle_10_1"
    },
    rnd: {
      [0]: ["cr_idle_0_0", "cr_idle_0_2"],
      [1]: ["cr_idle_1_0", "cr_idle_1_2"],
      [2]: ["cr_idle_2_0", "cr_idle_2_2"],
      [3]: ["cr_idle_3_0", "cr_idle_3_2"],
      [4]: ["cr_idle_4_0", "cr_idle_4_2"],
      [8]: ["cr_idle_8_0", "cr_idle_8_2"],
      [9]: ["cr_idle_9_0", "cr_idle_9_2"],
      [10]: ["cr_idle_10_0", "cr_idle_10_2"]
    }
  },

  play_guitar: {
    prop: {
      maxidle: 3,
      sumidle: 3,
      rnd: 80
    },
    into: {
      [0]: [
        "sit_1_guitar_0_0",
        { a: "guitar_a" },
        { f: (...args: Array<any>) => get_global<AnyCallablesModule>("sr_camp").start_guitar(...args) },
        "sit_1_guitar_0_1"
      ]
    },
    out: { [0]: ["guitar_0_sit_1_0", { d: "guitar_a" }, "guitar_0_sit_1_1"] },
    idle: { [0]: "guitar_0" },
    rnd: null
  },
  play_harmonica: {
    prop: {
      maxidle: 3,
      sumidle: 3,
      rnd: 80
    },
    into: {
      [0]: [
        "sit_2_harmonica_1_0",
        { a: "harmonica_a" },
        { f: (...args: Array<any>) => get_global<AnyCallablesModule>("sr_camp").start_harmonica(...args) },
        "sit_2_harmonica_1_1"
      ]
    },
    out: { [0]: ["harmonica_1_sit_2_0", { d: "harmonica_a" }, "harmonica_1_sit_2_1"] },
    idle: { [0]: "harmonica_0" },
    rnd: null
  },

  hello: {
    prop: {
      maxidle: 5,
      sumidle: 5,
      rnd: 100
    },
    into: null,
    out: null,
    idle: null,
    rnd: {
      [0]: ["hello_0_idle_0"],
      [1]: ["hello_1_idle_0"],
      [2]: ["hello_2_idle_0"],
      [3]: ["hello_3_idle_0"],
      [4]: ["hello_4_idle_0"],
      [8]: ["hello_8_idle_0"],
      [9]: ["hello_9_idle_0"],
      [10]: ["hello_10_idle_0"]
    }
  },
  refuse: {
    prop: {
      maxidle: 3,
      sumidle: 3,
      rnd: 100
    },
    into: null,
    out: null,
    idle: null,
    rnd: {
      [0]: ["net_0_0"],
      [1]: ["net_1_0"],
      [2]: ["net_2_0"],
      [3]: ["net_3_0"],
      [4]: ["net_4_0"],
      [8]: ["net_8_0"],
      [9]: ["net_9_0"],
      [10]: ["net_10_0"]
    }
  },
  claim: {
    prop: {
      maxidle: 5,
      sumidle: 2,
      rnd: 100
    },
    into: null,
    out: null,
    idle: null,
    rnd: {
      [0]: null,
      [1]: ["gop_stop_1_0"],
      [2]: ["gop_stop_2_0"],
      [3]: ["gop_stop_3_0"],
      [4]: ["gop_stop_4_0"],
      [8]: ["gop_stop_8_0"],
      [9]: ["gop_stop_9_0"],
      [10]: ["gop_stop_10_0"]
    }
  },
  backoff: {
    prop: {
      maxidle: 5,
      sumidle: 2,
      rnd: 100
    },
    into: null,
    out: null,
    idle: null,
    rnd: {
      [0]: ["uhodi_1_0", "uhodi_1_1"],
      [1]: ["uhodi_1_0", "uhodi_1_1"],
      [2]: ["uhodi_2_0", "uhodi_2_1"],
      [3]: ["uhodi_3_0", "uhodi_3_1"],
      [4]: ["uhodi_4_0", "uhodi_4_1"],
      [8]: ["uhodi_8_0", "uhodi_8_1"],
      [9]: ["uhodi_9_0", "uhodi_9_1"],
      [10]: ["uhodi_10_0", "uhodi_10_1"]
    }
  },

  punch: {
    prop: {
      maxidle: 5,
      sumidle: 2,
      rnd: 100
    },
    into: {
      [0]: [
        "norm_facer_0_0",
        { f: (...args: Array<any>) => get_global<AnyCallablesModule>("xr_effects").actor_punch(...args) },
        "norm_facer_0_1",
        { f: (...args: Array<any>) => get_global<AnyCallablesModule>("xr_effects").clearAbuse(...args) }
      ],
      [1]: [
        "norm_facer_1_0",
        { f: (...args: Array<any>) => get_global<AnyCallablesModule>("xr_effects").actor_punch(...args) },
        "norm_facer_1_1",
        { f: (...args: Array<any>) => get_global<AnyCallablesModule>("xr_effects").clearAbuse(...args) }
      ],
      [2]: [
        "norm_facer_2_0",
        { f: (...args: Array<any>) => get_global<AnyCallablesModule>("xr_effects").actor_punch(...args) },
        "norm_facer_2_1",
        { f: (...args: Array<any>) => get_global<AnyCallablesModule>("xr_effects").clearAbuse(...args) }
      ],
      [3]: [
        "norm_facer_3_0",
        { f: (...args: Array<any>) => get_global<AnyCallablesModule>("xr_effects").actor_punch(...args) },
        "norm_facer_3_1",
        { f: (...args: Array<any>) => get_global<AnyCallablesModule>("xr_effects").clearAbuse(...args) }
      ],
      [4]: [
        "norm_facer_4_0",
        { f: (...args: Array<any>) => get_global<AnyCallablesModule>("xr_effects").actor_punch(...args) },
        "norm_facer_4_1",
        { f: (...args: Array<any>) => get_global<AnyCallablesModule>("xr_effects").clearAbuse(...args) }
      ],
      [8]: [
        "norm_facer_8_0",
        { f: (...args: Array<any>) => get_global<AnyCallablesModule>("xr_effects").actor_punch(...args) },
        "norm_facer_8_1",
        { f: (...args: Array<any>) => get_global<AnyCallablesModule>("xr_effects").clearAbuse(...args) }
      ],
      [9]: [
        "norm_facer_9_0",
        { f: (...args: Array<any>) => get_global<AnyCallablesModule>("xr_effects").actor_punch(...args) },
        "norm_facer_9_1",
        { f: (...args: Array<any>) => get_global<AnyCallablesModule>("xr_effects").clearAbuse(...args) }
      ],
      [10]: [
        "norm_facer_10_0",
        { f: (...args: Array<any>) => get_global<AnyCallablesModule>("xr_effects").actor_punch(...args) },
        "norm_facer_10_1",
        { f: (...args: Array<any>) => get_global<AnyCallablesModule>("xr_effects").clearAbuse(...args) }
      ]
    },
    out: null,
    idle: null,
    rnd: null
  },

  sleeping: {
    prop: {
      maxidle: 5,
      sumidle: 10,
      rnd: 100
    },
    into: { [0]: ["idle_0_to_sit_0", "sit_to_sleep_0"] },
    out: { [0]: ["sleep_to_sit_0", "sit_0_to_idle_0"] },
    idle: { [0]: "sleep_idle_0" },
    rnd: { [0]: ["sleep_idle_1"] }
  },

  wounded: {
    prop: {
      maxidle: 5,
      sumidle: 10,
      rnd: 70
    },
    into: { [0]: ["idle_to_wounded_0"] },
    out: { [0]: ["wounded_to_idle_0"] },
    idle: { [0]: "wounded_idle_0" },
    rnd: null
  },
  wounded_heavy_1: {
    prop: {
      maxidle: 5,
      sumidle: 10,
      rnd: 70
    },
    into: { [0]: ["idle_to_wounded_1"] },
    out: { [0]: ["waunded_1_out"] },
    idle: { [0]: "waunded_1_idle_0" },
    rnd: null
  },
  wounded_heavy_2: {
    prop: {
      maxidle: 5,
      sumidle: 10,
      rnd: 70
    },
    into: { [0]: ["idle_to_wounded_2"] },
    out: { [0]: ["wounded_2_out"] },
    idle: { [0]: "wounded_2_idle_0" },
    rnd: null
  },
  wounded_heavy_3: {
    prop: {
      maxidle: 5,
      sumidle: 10,
      rnd: 70
    },
    into: { [0]: ["idle_to_wounded_3"] },
    out: { [0]: ["wounded_3_out"] },
    idle: { [0]: "wounded_3_idle_0" },
    rnd: null
  },
  wounded_zombie: {
    prop: {
      maxidle: 5,
      sumidle: 10,
      rnd: 70
    },
    into: { [0]: ["idle_to_wounded_0"] },
    out: { [0]: ["wounded_to_idle_0"] },
    idle: { [0]: "wounded_idle_0" },
    rnd: { [0]: ["wounded_idle_1"] }
  },

  choosing: {
    prop: {
      maxidle: 8,
      sumidle: 10,
      rnd: 80
    },
    into: null,
    out: null,
    idle: null,
    rnd: {
      [0]: ["komandir_0", "komandir_1", "komandir_2"]
    }
  },
  press: {
    prop: {
      maxidle: 8,
      sumidle: 10,
      rnd: 80
    },
    into: { [0]: ["knopka_0"] },
    out: { [0]: ["knopka_1"] },
    idle: { [0]: "knopka_2" },
    rnd: null
  },

  warding: {
    prop: {
      maxidle: 10,
      sumidle: 10,
      rnd: 0
    },
    into: { [0]: ["ohrana_0"] },
    out: { [0]: ["ohrana_2"] },
    idle: { [0]: "ohrana_1" },
    rnd: null
  },

  warding_short: {
    prop: {
      maxidle: 10,
      sumidle: 10,
      rnd: 0
    },
    into: { [0]: ["ohrana_0"] },
    out: { [0]: ["ohrana_2"] },
    idle: { [0]: "ohrana_1_short" },
    rnd: null
  },

  fold_arms: {
    prop: {
      maxidle: 10,
      sumidle: 10,
      rnd: 0
    },
    into: null,
    out: null,
    idle: { [0]: "cut_scene_idle_0" },
    rnd: null
  },

  talk_default: {
    prop: {
      maxidle: 5,
      sumidle: 5,
      rnd: 70
    },
    into: {
      [0]: null,
      [2]: ["norm_talk_2_in_0"]
    },
    out: {
      [0]: null,
      [2]: ["norm_talk_2_out_0"]
    },
    idle: {
      [0]: "idle_0_idle_1",
      [2]: "norm_talk_2_idle_1"
    },
    rnd: {
      [0]: ["idle_0_idle_0"],
      [2]: ["norm_talk_2_idle_0", "norm_talk_2_idle_2", "norm_talk_2_idle_3", "norm_talk_2_idle_4"]
    }
  },

  binocular: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100
    },
    into: { [0]: ["binoculars_draw_0", { a: "wpn_binoc" }, "binoculars_draw_1", "binoculars_zoom_in_0"] },

    out: { [0]: ["binoculars_zoom_out_0", "binoculars_hide_0", { d: "wpn_binoc" }, "binoculars_hide_1"] },
    idle: { [0]: "binoculars_zoom_idle_0" },
    rnd: {
      [0]: ["binoculars_zoom_idle_1", "binoculars_zoom_idle_2", "binoculars_zoom_idle_3", "binoculars_zoom_idle_4"]
    }
  },
  salut: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100
    },
    into: { [0]: ["chest_0_idle_0", "chest_0_idle_2"] },
    out: { [0]: ["chest_0_idle_3"] },
    idle: { [0]: "chest_0_idle_1" },
    rnd: null
  },
  salut_free: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100
    },
    into: { [0]: ["chest_1_idle_0"] },
    out: null,
    idle: null,
    rnd: null
  },
  hands_up: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100
    },
    into: null,
    out: null,
    idle: { [0]: "hand_up_0" },
    rnd: null
  },
  trans_0: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100
    },
    into: { [0]: ["idle_0_to_trans_0"] },
    out: { [0]: ["trans_0_to_idle_0"] },
    idle: { [0]: "trans_0_idle_0" },
    rnd: null
  },
  trans_1: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100
    },
    into: { [0]: ["idle_0_to_trans_1"] },
    out: { [0]: ["trans_1_to_idle_0"] },
    idle: { [0]: "trans_1_idle_0" },
    rnd: null
  },
  trans_zombied: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100
    },
    into: null,
    out: null,
    idle: { [0]: "trans_0_idle_1" },
    rnd: {
      [0]: ["trans_0_idle_0", "trans_0_idle_2", "trans_0_idle_3", "trans_0_idle_4", "trans_0_idle_5", "trans_0_idle_6"]
    }
  },

  probe_stand: {
    prop: {
      maxidle: 0,
      sumidle: 0,
      rnd: 100
    },
    into: {
      [0]: [
        "metering_anomalys_0_draw_0",
        { f: (...args: Array<any>) => get_global<AnyCallablesModule>("xr_effects").get_best_detector(...args) },
        "metering_anomalys_0_draw_1"
      ]
    },
    out: {
      [0]: [
        "metering_anomalys_0_hide_0",
        { f: (...args: Array<any>) => get_global<AnyCallablesModule>("xr_effects").hide_best_detector(...args) },
        "metering_anomalys_0_hide_1"
      ]
    },
    idle: { [0]: "metering_anomalys_0_idle_0" },
    rnd: {
      [0]: [
        "metering_anomalys_0_idle_1",
        "metering_anomalys_0_idle_2",
        "metering_anomalys_0_idle_3",
        "metering_anomalys_0_idle_4",
        "metering_anomalys_0_idle_5"
      ]
    }
  },

  probe_way: {
    prop: {
      maxidle: 0,
      sumidle: 0,
      rnd: 100
    },
    into: {
      [0]: [
        "metering_anomalys_0_draw_0",
        { f: (...args: Array<any>) => get_global<AnyCallablesModule>("xr_effects").get_best_detector(...args) },
        "metering_anomalys_0_draw_1",
        "metering_anomalys_0_idle_6"
      ]
    },
    out: {
      [0]: [
        "metering_anomalys_0_hide_0",
        { f: (...args: Array<any>) => get_global<AnyCallablesModule>("xr_effects").hide_best_detector(...args) },
        "metering_anomalys_0_hide_1"
      ]
    },
    idle: { [0]: "metering_anomalys_0_idle_0" },
    rnd: null
  },

  probe_crouch: {
    prop: {
      maxidle: 0,
      sumidle: 0,
      rnd: 100
    },
    into: {
      [0]: [
        "metering_anomalys_1_draw_0",
        { f: (...args: Array<any>) => get_global<AnyCallablesModule>("xr_effects").get_best_detector(...args) },
        "metering_anomalys_1_draw_1"
      ]
    },
    out: {
      [0]: [
        "metering_anomalys_1_hide_0",
        { f: (...args: Array<any>) => get_global<AnyCallablesModule>("xr_effects").hide_best_detector(...args) },
        "metering_anomalys_1_hide_1"
      ]
    },
    idle: { [0]: "metering_anomalys_1_idle_0" },
    rnd: {
      [0]: [
        "metering_anomalys_1_idle_1",
        "metering_anomalys_1_idle_2",
        "metering_anomalys_1_idle_3",
        "metering_anomalys_1_idle_4"
      ]
    }
  },

  scaner_stand: {
    prop: {
      maxidle: 0,
      sumidle: 0,
      rnd: 100
    },
    into: { [0]: ["metering_anomalys_0_draw_0", { a: "anomaly_scaner" }, "metering_anomalys_0_draw_1"] },
    out: { [0]: ["metering_anomalys_0_hide_0", { d: "anomaly_scaner" }, "metering_anomalys_0_hide_1"] },
    idle: { [0]: "metering_anomalys_0_idle_0" },
    rnd: {
      [0]: [
        "metering_anomalys_0_idle_1",
        "metering_anomalys_0_idle_2",
        "metering_anomalys_0_idle_3",
        "metering_anomalys_0_idle_4",
        "metering_anomalys_0_idle_5"
      ]
    }
  },

  scaner_way: {
    prop: {
      maxidle: 0,
      sumidle: 0,
      rnd: 100
    },
    into: {
      [0]: [
        "metering_anomalys_0_draw_0",
        { a: "anomaly_scaner" },
        "metering_anomalys_0_draw_1",
        "metering_anomalys_0_idle_6"
      ]
    },
    out: { [0]: ["metering_anomalys_0_hide_0", { d: "anomaly_scaner" }, "metering_anomalys_0_hide_1"] },
    idle: { [0]: "metering_anomalys_0_idle_0" },
    rnd: null
  },

  scaner_crouch: {
    prop: {
      maxidle: 0,
      sumidle: 0,
      rnd: 100
    },
    into: { [0]: ["metering_anomalys_1_draw_0", { a: "anomaly_scaner" }, "metering_anomalys_1_draw_1"] },
    out: { [0]: ["metering_anomalys_1_hide_0", { d: "anomaly_scaner" }, "metering_anomalys_1_hide_1"] },
    idle: { [0]: "metering_anomalys_1_idle_0" },
    rnd: {
      [0]: [
        "metering_anomalys_1_idle_1",
        "metering_anomalys_1_idle_2",
        "metering_anomalys_1_idle_3",
        "metering_anomalys_1_idle_4"
      ]
    }
  },

  prisoner: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100
    },
    into: { [0]: ["prisoner_0_sit_down_0"] },
    out: { [0]: ["prisoner_0_stand_up_0"] },
    idle: { [0]: "prisoner_0_sit_idle_0" },
    rnd: null
  },

  raciya: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100
    },
    into: {
      [0]: ["raciya_0_draw_0", { a: "hand_radio" }, "raciya_0_draw_1"],
      [1]: ["raciya_1_draw_0", { a: "hand_radio" }, "raciya_1_draw_1"],
      [2]: ["raciya_2_draw_0", { a: "hand_radio" }, "raciya_2_draw_1"],
      [3]: ["raciya_3_draw_0", { a: "hand_radio" }, "raciya_3_draw_1"],
      [4]: ["raciya_4_draw_0", { a: "hand_radio" }, "raciya_4_draw_1"],
      [8]: ["raciya_8_draw_0", { a: "hand_radio" }, "raciya_8_draw_1"],
      [9]: ["raciya_9_draw_0", { a: "hand_radio" }, "raciya_9_draw_1"],
      [10]: ["raciya_10_draw_0", { a: "hand_radio" }, "raciya_10_draw_1"]
    },
    out: {
      [0]: ["raciya_0_hide_0", { d: "hand_radio" }, "raciya_0_hide_1"],
      [1]: ["raciya_1_hide_0", { d: "hand_radio" }, "raciya_1_hide_1"],
      [2]: ["raciya_2_hide_0", { d: "hand_radio" }, "raciya_2_hide_1"],
      [3]: ["raciya_3_hide_0", { d: "hand_radio" }, "raciya_3_hide_1"],
      [4]: ["raciya_4_hide_0", { d: "hand_radio" }, "raciya_4_hide_1"],
      [8]: ["raciya_8_hide_0", { d: "hand_radio" }, "raciya_8_hide_1"],
      [9]: ["raciya_9_hide_0", { d: "hand_radio" }, "raciya_9_hide_1"],
      [10]: ["raciya_10_hide_0", { d: "hand_radio" }, "raciya_10_hide_1"]
    },
    idle: {
      [0]: "raciya_0_idle_0",
      [1]: "raciya_1_idle_0",
      [2]: "raciya_2_idle_0",
      [3]: "raciya_3_idle_0",
      [4]: "raciya_4_idle_0",
      [8]: "raciya_8_idle_0",
      [9]: "raciya_9_idle_0",
      [10]: "raciya_10_idle_0"
    },
    rnd: {
      [0]: ["raciya_0_talk_0"],
      [1]: ["raciya_1_talk_0"],
      [2]: ["raciya_2_talk_0"],
      [3]: ["raciya_3_talk_0"],
      [4]: ["raciya_4_talk_0"],
      [8]: ["raciya_8_talk_0"],
      [9]: ["raciya_9_talk_0"],
      [10]: ["raciya_10_talk_0"]
    }
  },

  cr_raciya: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100
    },
    into: {
      [0]: ["cr_raciya_0_draw_0", { a: "hand_radio" }, "cr_raciya_0_draw_1"],
      [1]: ["cr_raciya_1_draw_0", { a: "hand_radio" }, "cr_raciya_1_draw_1"],
      [2]: ["cr_raciya_2_draw_0", { a: "hand_radio" }, "cr_raciya_2_draw_1"],
      [3]: ["cr_raciya_3_draw_0", { a: "hand_radio" }, "cr_raciya_3_draw_1"],
      [4]: ["cr_raciya_4_draw_0", { a: "hand_radio" }, "cr_raciya_4_draw_1"],
      [8]: ["cr_raciya_8_draw_0", { a: "hand_radio" }, "cr_raciya_8_draw_1"],
      [9]: ["cr_raciya_9_draw_0", { a: "hand_radio" }, "cr_raciya_9_draw_1"],
      [10]: ["cr_raciya_10_draw_0", { a: "hand_radio" }, "cr_raciya_10_draw_1"]
    },
    out: {
      [0]: ["cr_raciya_0_hide_0", { d: "hand_radio" }, "cr_raciya_0_hide_1"],
      [1]: ["cr_raciya_1_hide_0", { d: "hand_radio" }, "cr_raciya_1_hide_1"],
      [2]: ["cr_raciya_2_hide_0", { d: "hand_radio" }, "cr_raciya_2_hide_1"],
      [3]: ["cr_raciya_3_hide_0", { d: "hand_radio" }, "cr_raciya_3_hide_1"],
      [4]: ["cr_raciya_4_hide_0", { d: "hand_radio" }, "cr_raciya_4_hide_1"],
      [8]: ["cr_raciya_8_hide_0", { d: "hand_radio" }, "cr_raciya_8_hide_1"],
      [9]: ["cr_raciya_9_hide_0", { d: "hand_radio" }, "cr_raciya_9_hide_1"],
      [10]: ["cr_raciya_10_hide_0", { d: "hand_radio" }, "cr_raciya_10_hide_1"]
    },
    idle: {
      [0]: "cr_raciya_0_idle_0",
      [1]: "cr_raciya_1_idle_0",
      [2]: "cr_raciya_2_idle_0",
      [3]: "cr_raciya_3_idle_0",
      [4]: "cr_raciya_4_idle_0",
      [8]: "cr_raciya_8_idle_0",
      [9]: "cr_raciya_9_idle_0",
      [10]: "cr_raciya_10_idle_0"
    },
    rnd: {
      [0]: ["cr_raciya_0_talk_0"],
      [1]: ["cr_raciya_1_talk_0"],
      [2]: ["cr_raciya_2_talk_0"],
      [3]: ["cr_raciya_3_talk_0"],
      [4]: ["cr_raciya_4_talk_0"],
      [8]: ["cr_raciya_8_talk_0"],
      [9]: ["cr_raciya_9_talk_0"],
      [10]: ["cr_raciya_10_talk_0"]
    }
  },

  psy_armed: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100
    },
    into: {
      [0]: ["idle_0_to_psy_0_idle_0"],
      [1]: ["idle_0_to_psy_1_idle_0"]
    },
    out: {
      [0]: ["psy_0_idle_0_to_idle_0"],
      [1]: ["psy_1_idle_0_to_idle_0"]
    },
    idle: {
      [0]: "psy_0_idle_0",
      [1]: "psy_1_idle_0"
    },
    rnd: {
      [0]: ["psy_0_idle_1", "psy_0_idle_2", "psy_0_idle_3"],
      [1]: ["psy_1_idle_1", "psy_1_idle_2", "psy_1_idle_3"]
    }
  },
  psy_shoot: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100
    },
    into: { [1]: ["psy_1_shot_0", { sh: 1000 }] },
    out: null,
    idle: { [1]: "psy_1_death_0" },
    rnd: null
  },
  lay_on_bed: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true
    },
    into: { [0]: ["cut_scene_0_actor"] },
    out: null,
    idle: null,
    rnd: null
  },

  search_corpse: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100
    },
    into: {
      [0]: [
        "dinamit_1",
        {
          f: (...args: Array<any>) => get_global<AnyCallablesModule>("xr_corpse_detection").get_all_from_corpse(...args)
        }
      ]
    },
    out: null,
    rnd: null,
    idle: null
  },

  help_wounded: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100
    },
    into: {
      [0]: [
        "dinamit_1",
        { f: (...args: Array<any>) => get_global<AnyCallablesModule>("xr_help_wounded").help_wounded(...args) }
      ]
    },
    out: null,
    rnd: null,
    idle: null
  }
} as any;

copyTable(animations, add_animpoint_animation_list());
copyTable(animations, add_animation_list_scenario());
copyTable(animations, add_animation_list_pri_a15());
