import { getSmartCoverAnimPriA22 } from "@/engine/core/objects/animation/smart_covers/anim_pri_a22";
import { getSmartCoverAnimpointPriA15 } from "@/engine/core/objects/animation/smart_covers/animpoint_pri_a15";
import { getSmartCoverAnimpointSitAss } from "@/engine/core/objects/animation/smart_covers/animpoint_sit_ass";
import { getSmartCoverAnimpointSitHigh } from "@/engine/core/objects/animation/smart_covers/animpoint_sit_high";
import { getSmartCoverAnimpointSitKnee } from "@/engine/core/objects/animation/smart_covers/animpoint_sit_knee";
import { getSmartCoverAnimpointSitLow } from "@/engine/core/objects/animation/smart_covers/animpoint_sit_low";
import { getSmartCoverAnimpointSitNormal } from "@/engine/core/objects/animation/smart_covers/animpoint_sit_normal";
import { getSmartCoverAnimpointStayTable } from "@/engine/core/objects/animation/smart_covers/animpoint_stay_table";
import { getSmartCoverAnimpointStayWall } from "@/engine/core/objects/animation/smart_covers/animpoint_stay_wall";
import { getSmartCoverCombatFront } from "@/engine/core/objects/animation/smart_covers/combat_front";
import { getSmartCoverCombatProne } from "@/engine/core/objects/animation/smart_covers/combat_prone";
import { ISmartCoverDescriptor } from "@/engine/core/objects/animation/smart_covers/types_smart_covers";
import { LuaLogger } from "@/engine/core/utils/logging";
import { TName } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

export const smartCoversList: LuaTable<TName, ISmartCoverDescriptor> = $fromObject<TName, ISmartCoverDescriptor>({
  /* --[[duplo: {
  loopholes: [
    // -- {
    // -- id: "loophole_enter",
    // -- fov_position: createVector(1.1, -.65 ,-1.4),
    // -- fov_direction: createVector(-1,0,0),
    // -- enter_direction: createVector(1,0,0),
    // -- enter_crouching: false,
    // -- enterable: true,
    // -- exitable: false,
    // -- usable: false,
    // -- actions: {
    // -- idle: {
    // -- "loophole_1_in_front_0",
    // -- },
    // -- },
    // -- },
    {
      id: "loophole_0",
      fov_position: createVector(1.1, 0, -1.4),
      fov_direction: createVector(-1, 0, 0),
      enter_direction: createVector(1, 0, 0),
      // --				enterable: false,
      // --				enterable: true,
      // --				enter_crouching: true,
      // --				exitable: true,
      usable: true,
      fov: 60.0,
      range: 32.0,
      actions: {
        idle: {
          animations: {
            idle: ["loophole_1_idle_0"]
          }
        },
        lookout: {
          animations: {
            idle: ["loophole_1_look_out_0"]
          }
        },
        fire: {
          animations: {
            idle: ["loophole_1_attack_idle_0"],
            shoot: ["loophole_1_attack_shoot_0"]
          }
        },
        fire_no_lookout: {
          animations: {
            idle: ["loophole_1_attack_idle_0"],
            shoot: ["loophole_1_attack_shoot_0"]
          }
        },
        reload: {
          animations: {
            idle: ["loophole_1_reload_0"]
          }
        },
        exit: {
          movement: true,
          position: createVector(0, 0, 2),
          animations: {
            idle: ["loophole_1_jump_0"]
          }
        }
      },
      transitions: [
        {
          action_from: "idle",
          action_to: "lookout",
          weight: 1.2,
          animations: ["loophole_1_look_in_0"]
        },
        {
          action_from: "lookout",
          action_to: "idle",
          weight: 1.2,
          animations: ["loophole_1_look_out_0"]
        },
        {
          action_from: "idle",
          action_to: "fire",
          weight: 1.2,
          animations: ["loophole_1_attack_in_0"]
        },
        {
          action_from: "fire",
          action_to: "idle",
          weight: 1.2,
          animations: ["loophole_1_attack_out_0"]
        },
        {
          action_from: "idle",
          action_to: "fire_no_lookout",
          weight: 1.2,
          animations: ["loophole_1_attack_in_0"]
        },
        {
          action_from: "fire_no_lookout",
          action_to: "idle",
          weight: 1.2,
          animations: ["loophole_1_attack_out_0"]
        }
      ]
    },
    // -- {
    // -- id: "loophole_1",
    // -- position: createVector(0.5,0,2),
    // -- direction: createVector(0,0,-1),
    // -- enterable: false,
    // -- usable: true,
    // -- fov	= 60.0,
    // -- range: 32.0,
    // -- actions: {
    // -- idle: {
    // -- animations: {
    // -- idle: {
    // -- "loophole_1_idle_0",
    // -- },
    // -- },
    // -- },
    // -- lookout: {
    // -- animations: {
    // -- idle: {
    // -- "loophole_1_lookout_0",
    // -- },
    // -- },
    // -- },
    // -- fire: {
    // -- animations: {
    // -- idle: {
    // -- "loophole_1_attack_idle_0",
    // -- },
    // -- shoot: {
    // -- "loophole_1_attack_shoot_0",
    // -- },
    // -- },
    // -- },
    // -- fire_no_lookout: {
    // -- animations: {
    // -- idle: {
    // -- "loophole_1_attack_idle_0",
    // -- },
    // -- shoot: {
    // -- "loophole_1_attack_shoot_0",
    // -- },
    // -- },
    // -- },
    // -- reload: {
    // -- animations: {
    // -- idle: {
    // -- "loophole_1_reload_0",
    // -- },
    // -- },
    // -- },
    // -- exit: {
    // -- movement: true,
    // -- position: createVector(0,0,2),
    // -- animations: {
    // -- idle: {
    // -- "loophole_1_attack_idle_0",
    // -- },
    // -- },
    // -- },
    // -- },
    // -- transitions: {
    // -- {
    // -- action_from: "idle",
    // -- action_to: "lookout",
    // -- weight: 1.2,
    // -- animations: {
    // -- "loophole_1_idle_to_look_0",
    // -- },
    // -- },
    // -- {
    // -- action_from: "lookout",
    // -- action_to: "idle",
    // -- weight: 1.2,
    // -- animations: {
    // -- "loophole_1_look_to_idle_0",
    // -- },
    // -- },
    // -- {
    // -- action_from: "idle",
    // -- action_to: "fire",
    // -- weight: 1.2,
    // -- animations: {
    // -- "loophole_1_idle_to_attack_0",
    // -- },
    // -- },
    // -- {
    // -- action_from: "fire",
    // -- action_to: "idle",
    // -- weight: 1.2,
    // -- animations: {
    // -- "loophole_1_attack_to_idle_0",
    // -- },
    // -- },
    // -- {
    // -- action_from: "idle",
    // -- action_to: "fire_no_lookout",
    // -- weight: 1.2,
    // -- animations: {
    // -- "loophole_1_idle_to_attack_0",
    // -- },
    // -- },
    // -- {
    // -- action_from: "fire_no_lookout",
    // -- action_to: "idle",
    // -- weight: 1.2,
    // -- animations: {
    // -- "loophole_1_attack_to_idle_0",
    // -- },
    // -- },
    // -- },
    // -- },
    {
      id: "loophole_2",
      fov_position: createVector(1.1, 0, 1.4),
      fov_direction: createVector(-1, 0, 0),
      enter_direction: createVector(1, 0, 0),
      enterable: true,
      enter_crouching: true,
      exitable: false,
      usable: true,
      fov = 60.0,
      range: 32.0,
      actions: {
        idle: {
          animations: {
            idle: ["loophole_3_idle_0"]
          }
        },
        lookout: {
          animations: {
            idle: ["loophole_3_look_out_0"]
          }
        },
        fire: {
          animations: {
            idle: ["loophole_3_attack_idle_0"],
            shoot: ["loophole_3_attack_shoot_0"]
          }
        },
        fire_no_lookout: {
          animations: {
            idle: ["loophole_3_look_idle_0"],
            shoot: ["loophole_3_look_shoot_0"]
          }
        },
        reload: {
          animations: {
            idle: ["loophole_3_reload_0"]
          }
        },
        exit: {
          movement: true,
          position: createVector(0, 0, 2),
          animations: {
            idle: ["loophole_3_jump_0"]
          }
        }
      },
      transitions: [
        {
          action_from: "idle",
          action_to: "lookout",
          weight: 1.2,
          animations: ["loophole_3_look_in_0"]
        },
        {
          action_from: "lookout",
          action_to: "idle",
          weight: 1.2,
          animations: ["loophole_3_look_out_0"]
        },
        {
          action_from: "idle",
          action_to: "fire",
          weight: 1.2,
          animations: ["loophole_3_attack_in_0"]
        },
        {
          action_from: "fire",
          action_to: "idle",
          weight: 1.2,
          animations: ["loophole_3_attack_out_0"]
        },
        {
          action_from: "idle",
          action_to: "fire_no_lookout",
          weight: 1.2,
          animations: ["loophole_3_no_look_in_0"]
        },
        {
          action_from: "fire_no_lookout",
          action_to: "idle",
          weight: 1.2,
          animations: ["loophole_3_no_look_out_0"]
        }
      ]
    }
    // -- {
    // -- id: "loophole_3",
    // -- position: createVector (-0.5,0,-2),
    // -- direction: createVector(0,0,1),
    // -- enterable: false,
    // -- usable: true,
    // -- fov	= 60.0,
    // -- range: 32.0,
    // -- actions: {
    // -- idle: {
    // -- animations: {
    // -- idle: {
    // -- "loophole_1_idle_0",
    // -- },
    // -- },
    // -- },
    // -- lookout: {
    // -- animations: {
    // -- idle: {
    // -- "loophole_1_lookout_0",
    // -- },
    // -- },
    // -- },
    // -- fire: {
    // -- animations: {
    // -- idle: {
    // -- "loophole_1_attack_idle_0",
    // -- },
    // -- shoot: {
    // -- "loophole_1_attack_shoot_0",
    // -- },
    // -- },
    // -- },
    // -- fire_no_lookout: {
    // -- animations: {
    // -- idle: {
    // -- "loophole_1_attack_idle_0",
    // -- },
    // -- shoot: {
    // -- "loophole_1_attack_shoot_0",
    // -- },
    // -- },
    // -- },
    // -- reload: {
    // -- animations: {
    // -- idle: {
    // -- "loophole_1_reload_0",
    // -- },
    // -- },
    // -- },
    // -- exit: {
    // -- movement: true,
    // -- position: createVector(0,0,2),
    // -- animations: {
    // -- idle: {
    // -- "loophole_1_attack_idle_0",
    // -- },
    // -- },
    // -- },
    // -- },
    // -- transitions: {
    // -- {
    // -- action_from: "idle",
    // -- action_to: "lookout",
    // -- weight: 1.2,
    // -- animations: {
    // -- "loophole_1_idle_to_look_0",
    // -- },
    // -- },
    // -- {
    // -- action_from: "lookout",
    // -- action_to: "idle",
    // -- weight: 1.2,
    // -- animations: {
    // -- "loophole_1_look_to_idle_0",
    // -- },
    // -- },
    // -- {
    // -- action_from: "idle",
    // -- action_to: "fire",
    // -- weight: 1.2,
    // -- animations: {
    // -- "loophole_1_idle_to_attack_0",
    // -- },
    // -- },
    // -- {
    // -- action_from: "fire",
    // -- action_to: "idle",
    // -- weight: 1.2,
    // -- animations: {
    // -- "loophole_1_attack_to_idle_0",
    // -- },
    // -- },
    // -- {
    // -- action_from: "idle",
    // -- action_to: "fire_no_lookout",
    // -- weight: 1.2,
    // -- animations: {
    // -- "loophole_1_idle_to_attack_0",
    // -- },
    // -- },
    // -- {
    // -- action_from: "fire_no_lookout",
    // -- action_to: "idle",
    // -- weight: 1.2,
    // -- animations: {
    // -- "loophole_1_attack_to_idle_0",
    // -- },
    // -- },
    // -- },
    // -- },
  ],
  transitions: [
    {
      vertex0: "",
      vertex1: "loophole_0",
      weight: 1.0,
      actions: [
        {
          position: createVector(0, -0.67, 1),
          precondition_functor: "xr_conditions.always",
          precondition_params: "",
          animation: "loophole_1_in_front_0"
        }
      ]
    },
    {
      vertex0: "loophole_0",
      vertex1: "",
      weight: 1.0,
      actions: [
        {
          position: createVector(0, 0, 1),
          precondition_functor: "xr_conditions.always",
          precondition_params: "",
          // --body_state: move.standing, movement_type: move.run,
          // --time: 5.0,
          animation: "loophole_1_exit_jump_0"
        }
      ]
    },
    {
      vertex0: "loophole_0",
      vertex1: "loophole_2",
      weight: 1.0,
      actions: [
        {
          position: createVector(0, 0, 1),
          precondition_functor: "xr_conditions.always",
          precondition_params: "",
          animation: "loophole_transition_1_to_3"
        }
      ]
    },
    {
      vertex0: "loophole_2",
      vertex1: "loophole_0",
      weight: 1.1,
      actions: [
        {
          position: createVector(0, 0, 1),
          precondition_functor: "xr_conditions.always",
          precondition_params: "",
          animation: "loophole_transition_3_to_1"
        }
      ]
    }
  ],
  // --]] */

  // --combat 					= smart_covers_combat.get_smart_cover(),
  combat_prone: getSmartCoverCombatProne(),
  combat_front: getSmartCoverCombatFront(),
  animpoint_stay_wall: getSmartCoverAnimpointStayWall(),
  animpoint_stay_table: getSmartCoverAnimpointStayTable(),
  animpoint_sit_high: getSmartCoverAnimpointSitHigh(),
  animpoint_sit_normal: getSmartCoverAnimpointSitNormal(),
  animpoint_sit_low: getSmartCoverAnimpointSitLow(),
  animpoint_sit_knee: getSmartCoverAnimpointSitKnee(),
  animpoint_sit_ass: getSmartCoverAnimpointSitAss(),
  animpoint_pri_a15: getSmartCoverAnimpointPriA15(),
  anim_pri_a22: getSmartCoverAnimPriA22(),

  // --cover_loophole_1: smart_covers_cover_loophole_1.get_smart_cover_cover_loophole_1(),
  // --cover_loophole_2: smart_covers_cover_loophole_2.get_smart_cover_cover_loophole_2(),
  // --cover_loophole_3: smart_covers_cover_loophole_3.get_smart_cover_cover_loophole_3(),
  // --cover_loophole_1_2: smart_covers_cover_loophole_1_2.get_smart_cover_cover_loophole_1_2(),
  // --cover_loophole_2_3: smart_covers_cover_loophole_2_3.get_smart_cover_cover_loophole_2_3(),
  // --cover_loophole_1_3: smart_covers_cover_loophole_1_3.get_smart_cover_cover_loophole_1_3(),
  // --cover_loophole_1_2_3: smart_covers_cover_loophole_1_2_3.get_smart_cover_cover_loophole_1_2_3(),
  // --cover_loophole_4: smart_covers_cover_loophole_4.get_smart_cover_cover_loophole_4(),
  // --cover_loophole_5: smart_covers_cover_loophole_5.get_smart_cover_cover_loophole_5(),
  // --cover_loophole_4_5: smart_covers_cover_loophole_4_5.get_smart_cover_cover_loophole_4_5(),
  // --cover_loophole_6: smart_covers_cover_loophole_6.get_smart_cover_cover_loophole_6(),
  // --cover_loophole_7: smart_covers_cover_loophole_7.get_smart_cover_cover_loophole_7(),
  // --cover_loophole_6_7: smart_covers_cover_loophole_6_7.get_smart_cover_cover_loophole_6_7(),
  // --cover_loophole_8: smart_covers_cover_loophole_8.get_smart_cover_cover_loophole_8(),
  // --cover_loophole_9: smart_covers_cover_loophole_9.get_smart_cover_cover_loophole_9(),
  // --cover_loophole_10: smart_covers_cover_loophole_10.get_smart_cover_cover_loophole_10(),
  // --cover_loophole_11: smart_covers_cover_loophole_11.get_smart_cover_cover_loophole_11(),
  // --cover_loophole_10_11: smart_covers_cover_loophole_10_11.get_smart_cover_cover_loophole_10_11(),
  // --cover_loophole_10_8: smart_covers_cover_loophole_10_8.get_smart_cover_cover_loophole_10_8(),
  // --cover_loophole_8_11: smart_covers_cover_loophole_8_11.get_smart_cover_cover_loophole_8_11(),
  // --cover_loophole_10_8_11: smart_covers_cover_loophole_10_8_11.get_smart_cover_cover_loophole_10_8_11(),

  // --cover_loophole_1_jump: smart_covers_cover_loophole_1_jump.get_smart_cover_cover_loophole_1_jump(),
  // --cover_loophole_2_jump: smart_covers_cover_loophole_2_jump.get_smart_cover_cover_loophole_2_jump(),
  // --cover_loophole_3_jump: smart_covers_cover_loophole_3_jump.get_smart_cover_cover_loophole_3_jump(),
  // --cover_loophole_1_2_jump: smart_covers_cover_loophole_1_2_jump.get_smart_cover_cover_loophole_1_2_jump(),
  // --cover_loophole_2_3_jump: smart_covers_cover_loophole_2_3_jump.get_smart_cover_cover_loophole_2_3_jump(),
  // --cover_loophole_1_3_jump: smart_covers_cover_loophole_1_3_jump.get_smart_cover_cover_loophole_1_3_jump(),
  // --cover_loophole_1_2_3_jump: smart_covers_cover_loophole_1_2_3_jump.get_smart_cover_cover_loophole_1_2_3_jump(),

  // --cover_loophole_lead_sit_sleep_mechanic:
  // smart_covers_cover_loophole_lead_sit_sleep_mechanic.get_smart_cover_cover_loophole_lead_sit_sleep_mechanic(),
  // --cover_loophole_lead_sit_sleep_write:
  // smart_covers_cover_loophole_lead_sit_sleep_write.get_smart_cover_cover_loophole_lead_sit_sleep_write(),
  // --cover_loophole_lead_sit_sleep_write_temp:
  // smart_covers_cover_loophole_lead_sit_sleep_write_temp.get_smart_cover_cover_loophole_lead_sit_sleep_write(),
  // --cover_loophole_lead_sit_strong:
  // smart_covers_cover_loophole_lead_sit_strong.get_smart_cover_cover_loophole_lead_sit_strong(),
  // --cover_loophole_lead_stand_hit_tv:
  // smart_covers_cover_loophole_lead_stand_hit_tv.get_smart_cover_cover_loophole_lead_stand_hit_tv(),
  // --cover_loophole_lead_stand_lean_on_bar:
  // smart_covers_cover_loophole_lead_stand_lean_on_bar.get_smart_cover_cover_loophole_lead_stand_lean_on_bar(),
  // --cover_loophole_lead_stand_look_at_table:
  // smart_covers_cover_loophole_lead_stand_look_at_table.get_smart_cover_cover_loophole_lead_stand_look_at_table(),
  // --cover_loophole_lead_stand_look_down_2:
  // smart_covers_cover_loophole_lead_stand_look_down_2.get_smart_cover_cover_loophole_lead_stand_look_down_2(),
  // --cover_loophole_lead_stand_look_down_3:
  // smart_covers_cover_loophole_lead_stand_look_down_3.get_smart_cover_cover_loophole_lead_stand_look_down_3(),
  // --cover_loophole_lead_stand_look_in_window:
  // smart_covers_cover_loophole_lead_stand_look_in_window.get_smart_cover_cover_loophole_lead_stand_look_in_window(),
  // --cover_loophole_lead_stand_look_up:
  // smart_covers_cover_loophole_lead_stand_look_up.get_smart_cover_cover_loophole_lead_stand_look_up(),

  // --cover_loophole_stc_cover_1: smart_covers_stc_cover_1.get_smart_cover_stc_1(),
  // --cover_loophole_stc_cover_2: smart_covers_stc_cover_2.get_smart_cover_stc_2(),
  // --cover_loophole_stc_cover_3: smart_covers_stc_cover_3.get_smart_cover_stc_3(),
  // --cover_loophole_lead_forester_idle_talk:
  // smart_covers_cover_loophole_lead_forester_idle_talk.get_smart_cover_cover_loophole_lead_forester_idle_talk(),

  // --cover_loophole_1_3_test: smart_covers_cover_loophole_1_3_test.get_smart_cover_cover_loophole_1_3_test(),
  // --cover_barricade_0: smart_covers_cover_barricade_0.get_smart_cover_cover_barricade_0(),
  // --cover_barricade_1: smart_covers_cover_barricade_1.get_smart_cover_cover_barricade_1(),
  // --cover_barricade_2: smart_covers_cover_barricade_2.get_smart_cover_cover_barricade_2(),
  // --cover_barricade_3: smart_covers_cover_barricade_3.get_smart_cover_cover_barricade_3(),
  // --cover_barricade_commander: smart_covers_cover_barricade_commander.get_smart_cover_cover_barricade_commander(),
  // --cover_loophole_minigunner: smart_covers_cover_loophole_minigunner.get_smart_cover_cover_loophole_minigunner()
});
