import { EStalkerState, IAnimationStateDescriptor } from "@/engine/core/objects/state/types";
import { add_animstate_animation_list } from "@/engine/core/objects/state_lib/state_mgr_animstate_list_animpoint";
import { copyTable } from "@/engine/core/utils/table";

/**
 * todo;
 */
export const animstates: LuaTable<EStalkerState, IAnimationStateDescriptor> = $fromObject<
  EStalkerState,
  IAnimationStateDescriptor
>({
  sit: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80,
    },
    into: { [0]: ["idle_0_to_sit_0"] },
    out: { [0]: ["sit_0_to_idle_0"] },
    idle: { [0]: "sit_0_idle_0" },
    rnd: {
      [0]: ["sit_0_idle_1", "sit_0_idle_2", "sit_0_idle_3"],
    },
  },
  sit_knee: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80,
    },
    into: { [0]: ["idle_0_to_sit_1"] },
    out: { [0]: ["sit_1_to_idle_0"] },
    idle: { [0]: "sit_1_idle_0" },
    rnd: {
      [0]: ["sit_1_idle_1", "sit_1_idle_2", "sit_1_idle_3"],
    },
  },
  sit_ass: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80,
    },
    into: { [0]: ["idle_0_to_sit_2"] },
    out: { [0]: ["sit_2_to_idle_0"] },
    idle: { [0]: "sit_2_idle_0" },
    rnd: {
      [0]: ["sit_2_idle_1", "sit_2_idle_2", "sit_2_idle_3"],
    },
  },
} as unknown as Record<EStalkerState, IAnimationStateDescriptor>);

copyTable(animstates, add_animstate_animation_list());
