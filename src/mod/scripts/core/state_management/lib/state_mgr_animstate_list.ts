// eslint-disable-next-line max-len
import { add_animstate_animation_list } from "@/mod/scripts/core/state_management/lib/state_mgr_animstate_list_animpoint";
import { copyTable } from "@/mod/scripts/utils/table";

export interface IAnimationStateDescriptor {
  prop: {
    maxidle: number;
    sumidle: number;
    rnd: number;
  };
  into: LuaTable<number, string>;
  out: LuaTable<number, string>;
  idle: LuaTable<number, string>;
  rnd: LuaTable<number, LuaTable<number, string>>;
}

export const animstates: LuaTable<string, IAnimationStateDescriptor> = {
  sit: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80
    },
    into: { [0]: ["idle_0_to_sit_0"] },
    out: { [0]: ["sit_0_to_idle_0"] },
    idle: { [0]: "sit_0_idle_0" },
    rnd: {
      [0]: ["sit_0_idle_1", "sit_0_idle_2", "sit_0_idle_3"]
    }
  },
  sit_knee: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80
    },
    into: { [0]: ["idle_0_to_sit_1"] },
    out: { [0]: ["sit_1_to_idle_0"] },
    idle: { [0]: "sit_1_idle_0" },
    rnd: {
      [0]: ["sit_1_idle_1", "sit_1_idle_2", "sit_1_idle_3"]
    }
  },
  sit_ass: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80
    },
    into: { [0]: ["idle_0_to_sit_2"] },
    out: { [0]: ["sit_2_to_idle_0"] },
    idle: { [0]: "sit_2_idle_0" },
    rnd: {
      [0]: ["sit_2_idle_1", "sit_2_idle_2", "sit_2_idle_3"]
    }
  }
} as any;

copyTable(animstates, add_animstate_animation_list());
