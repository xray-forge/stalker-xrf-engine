import { anim, CSightParams, look, move, TXR_animation, TXR_look, TXR_move, TXR_SightType } from "xray16";

import { Optional } from "@/mod/lib/types";
import { add_state_lib_animpoint } from "@/mod/scripts/core/state_management/lib/state_lib_animpoint";
import { add_state_lib_pri_a15 } from "@/mod/scripts/core/state_management/lib/state_mgr_pri_a15";
import { add_state_lib_scenario } from "@/mod/scripts/core/state_management/lib/state_mgr_scenario";
import { copyTable } from "@/mod/scripts/utils/table";

export interface IStateDescriptor {
  weapon: Optional<string>;
  movement?: Optional<TXR_move>;
  mental: Optional<TXR_animation>;
  bodystate: Optional<TXR_move>;
  animstate: Optional<string>;
  animation: Optional<string>;
  weapon_slot?: Optional<number>;
  direction?: TXR_look | TXR_SightType;
  special_danger_move?: Optional<boolean>;
  fast_set?: Optional<boolean>;
}

export const states: LuaTable<string, IStateDescriptor> = {
  idle: {
    weapon: null,
    movement: null,
    mental: null,
    bodystate: null,
    animstate: null,
    animation: null
  },
  smartcover: {
    weapon: "unstrapped",
    movement: null,
    mental: null,
    bodystate: null,
    animstate: null,
    animation: null,
    direction: CSightParams.eSightTypeAnimationDirection
  },
  walk: {
    weapon: "strapped",
    movement: move.walk,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: null
  },
  walk_noweap: {
    weapon: "none",
    movement: move.walk,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: null
  },
  run: {
    weapon: "strapped",
    movement: move.run,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: null
  },
  sprint: {
    weapon: "strapped",
    movement: move.run,
    mental: anim.panic,
    bodystate: move.standing,
    animstate: null,
    animation: null
  },
  patrol: {
    weapon: "unstrapped",
    movement: move.walk,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: null
  },
  patrol_fire: {
    weapon: "fire",
    movement: move.walk,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: null
  },
  raid: {
    weapon: "unstrapped",
    movement: move.walk,
    mental: anim.danger,
    special_danger_move: true,
    bodystate: move.standing,
    animstate: null,
    animation: null
  },
  raid_fire: {
    weapon: "fire",
    movement: move.walk,
    mental: anim.danger,
    bodystate: move.standing,
    animstate: null,
    animation: null
  },
  sneak: {
    weapon: "unstrapped",
    movement: move.walk,
    mental: anim.danger,
    bodystate: move.crouch,
    animstate: null,
    animation: null
  },
  sneak_run: {
    weapon: "unstrapped",
    movement: move.run,
    mental: anim.danger,
    bodystate: move.crouch,
    animstate: null,
    animation: null
  },
  sneak_no_wpn: {
    weapon: "strapped",
    movement: move.walk,
    mental: anim.danger,
    bodystate: move.crouch,
    animstate: null,
    animation: null
  },
  sneak_fire: {
    weapon: "fire",
    movement: move.walk,
    mental: anim.danger,
    bodystate: move.crouch,
    animstate: null,
    animation: null
  },
  assault: {
    weapon: "unstrapped",
    movement: move.run,
    mental: anim.danger,
    bodystate: move.standing,
    animstate: null,
    animation: null
  },
  assault_fire: {
    weapon: "fire",
    movement: move.run,
    mental: anim.danger,
    bodystate: move.standing,
    animstate: null,
    animation: null
  },
  rush: {
    weapon: "unstrapped",
    movement: move.run,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: null
  },

  // -- ������� ���������
  wait: {
    weapon: "strapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "idle"
  },
  wait_trade: {
    weapon: "none",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "idle"
  },
  wait_na: {
    weapon: "strapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: null
  },
  guard: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "idle"
  },
  guard_chasovoy: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "idle_chasovoy"
  },
  guard_na: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: null
  },
  guard_fire: {
    weapon: "fire",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: null
  },
  threat: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.danger,
    bodystate: move.standing,
    animstate: null,
    animation: null,
    fast_set: true
  },
  threat_danger: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.danger,
    bodystate: move.standing,
    animstate: null,
    animation: "bloodsucker_search"
  },
  give_orders: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.danger,
    bodystate: move.standing,
    animstate: null,
    animation: "give_orders"
  },
  threat_heli: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.danger,
    bodystate: move.standing,
    animstate: null,
    animation: null
  },
  threat_na: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.danger,
    bodystate: move.standing,
    animstate: null,
    animation: null,
    fast_set: true
  },
  threat_fire: {
    weapon: "fire",
    movement: move.stand,
    mental: anim.danger,
    bodystate: move.standing,
    animstate: null,
    animation: null
  },
  threat_sniper_fire: {
    weapon: "sniper_fire",
    movement: move.stand,
    mental: anim.danger,
    bodystate: move.standing,
    animstate: null,
    animation: null
  },
  hide: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.danger,
    bodystate: move.crouch,
    animstate: null,
    animation: "hide"
  },
  hide_na: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.danger,
    bodystate: move.crouch,
    animstate: null,
    animation: null
  },
  hide_fire: {
    weapon: "fire",
    movement: move.stand,
    mental: anim.danger,
    bodystate: move.crouch,
    animstate: null,
    animation: null
  },
  hide_sniper_fire: {
    weapon: "sniper_fire",
    movement: move.stand,
    mental: anim.danger,
    bodystate: move.crouch,
    animstate: null,
    animation: null
  },
  caution: {
    weapon: null,
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "caution"
  },
  choose: {
    weapon: "strapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "choosing"
  },
  press: {
    weapon: "strapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "press"
  },
  ward: {
    weapon: "strapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "warding"
  },
  ward_short: {
    weapon: "strapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "warding_short"
  },
  ward_noweap: {
    weapon: "none",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "warding"
  },
  ward_noweap_short: {
    weapon: "none",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "warding_short"
  },
  fold_arms: {
    weapon: "none",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "fold_arms"
  },

  search: {
    weapon: null,
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "poisk"
  },
  stoop_no_weap: {
    weapon: "strapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "stoop_no_weap"
  },
  salut: {
    weapon: "strapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "salut"
  },
  salut_free: {
    weapon: "strapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "salut_free"
  },
  prisoner: {
    weapon: "strapped",
    movement: null,
    mental: anim.danger,
    bodystate: move.standing,
    animstate: null,
    animation: "prisoner"
  },

  hide_no_wpn: {
    weapon: "strapped",
    movement: move.stand,
    mental: anim.danger,
    bodystate: move.crouch,
    animstate: null,
    animation: "hide"
  },
  // -- ������� ���������
  sit: {
    weapon: "strapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: "sit",
    animation: null
  },
  sit_knee: {
    weapon: "strapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: "sit_knee",
    animation: null
  },
  sit_ass: {
    weapon: "strapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: "sit_ass",
    animation: null
  },

  play_guitar: {
    weapon: "strapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: "sit_knee",
    animation: "play_guitar"
  },
  play_harmonica: {
    weapon: "strapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: "sit_ass",
    animation: "play_harmonica"
  },

  sleep: {
    weapon: "strapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "sleeping"
  },

  hello: {
    weapon: "strapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "hello"
  },
  hello_wpn: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "hello"
  },

  refuse: {
    weapon: "strapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "refuse"
  },
  claim: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.danger,
    bodystate: move.standing,
    animstate: null,
    animation: "claim"
  },
  backoff: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.danger,
    bodystate: move.standing,
    animstate: null,
    animation: "backoff"
  },
  backoff2: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.danger,
    bodystate: move.standing,
    animstate: null,
    animation: "backoff"
  },
  punch: {
    weapon: null,
    movement: move.stand,
    mental: anim.danger,
    bodystate: move.standing,
    animstate: null,
    animation: "punch"
  },

  search_corpse: {
    weapon: "strapped",
    movement: move.stand,
    mental: anim.danger,
    bodystate: move.crouch,
    animstate: null,
    animation: "search_corpse"
  },

  help_wounded: {
    weapon: "strapped",
    movement: move.stand,
    mental: anim.danger,
    bodystate: move.crouch,
    animstate: null,
    animation: "help_wounded"
  },

  dynamite: {
    weapon: "strapped",
    movement: move.stand,
    mental: anim.danger,
    bodystate: move.crouch,
    animstate: null,
    animation: "dynamite"
  },

  binocular: {
    weapon: "strapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "binocular"
  },
  hide_rac: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.danger,
    bodystate: move.crouch,
    animstate: null,
    animation: "cr_raciya"
  },
  wait_rac: {
    weapon: "strapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "raciya"
  },
  wait_rac_noweap: {
    weapon: "none",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "raciya"
  },
  wait_rac_stc: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "raciya_stc"
  },
  guard_rac: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "raciya"
  },

  probe_stand: {
    weapon: "strapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "probe_stand"
  },
  probe_stand_detector_advanced: {
    weapon: "strapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "probe_stand_detector_advanced"
  },
  probe_stand_detector_elite: {
    weapon: "strapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "probe_stand_detector_elite"
  },
  probe_way: {
    weapon: "strapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "probe_way"
  },
  probe_way_detector_advanced: {
    weapon: "strapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "probe_way_detector_advanced"
  },
  probe_way_detector_elite: {
    weapon: "strapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "probe_way_detector_elite"
  },
  probe_crouch: {
    weapon: "strapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "probe_crouch"
  },
  probe_crouch_detector_advanced: {
    weapon: "strapped",
    movement: move.stand,
    mental: anim.danger,
    bodystate: move.standing,
    animstate: null,
    animation: "probe_crouch_detector_advanced"
  },
  probe_crouch_detector_elite: {
    weapon: "strapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "probe_crouch_detector_elite"
  },

  scaner_stand: {
    weapon: "strapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "scaner_stand"
  },
  scaner_way: {
    weapon: "strapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "scaner_way"
  },

  scaner_crouch: {
    weapon: "strapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "scaner_crouch"
  },

  hands_up: {
    weapon: "strapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "hands_up"
  },

  // -- �������
  wounded: {
    weapon: "strapped",
    movement: move.stand,
    mental: anim.danger,
    bodystate: move.crouch,
    direction: look.cur_dir,
    animstate: null,
    animation: "wounded"
  },
  wounded_heavy: {
    weapon: "drop",
    movement: move.stand,
    mental: anim.danger,
    bodystate: move.crouch,
    direction: look.cur_dir, // --CSightParams.eSightTypeAnimationDirection
    animstate: null,
    animation: "wounded_heavy_1"
  },
  wounded_heavy_2: {
    weapon: "drop",
    movement: move.stand,
    mental: anim.danger,
    bodystate: move.crouch,
    direction: look.cur_dir,
    animstate: null,
    animation: "wounded_heavy_2"
  },
  wounded_heavy_3: {
    weapon: "drop",
    movement: move.stand,
    mental: anim.danger,
    bodystate: move.crouch,
    direction: look.cur_dir,
    animstate: null,
    animation: "wounded_heavy_3"
  },
  wounded_zombie: {
    weapon: "drop",
    movement: move.stand,
    mental: anim.danger,
    bodystate: move.crouch,
    direction: look.cur_dir,
    animstate: null,
    animation: "wounded_zombie"
  },
  trans_0: {
    weapon: "strapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "trans_0"
  },
  trans_1: {
    weapon: "strapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "trans_1"
  },
  trans_zombied: {
    weapon: "strapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "trans_zombied"
  },

  talk_default: {
    weapon: "strapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "talk_default"
  },

  // -- ��� �������
  psy_pain: {
    weapon: "drop",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "psy_armed"
  },
  psy_armed: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "psy_armed"
  },
  psy_shoot: {
    weapon: "fire",
    weapon_slot: 1,
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "psy_shoot"
  },
  lay_on_bed: {
    weapon: "drop",
    movement: move.stand,
    mental: anim.danger,
    bodystate: move.crouch,
    direction: look.cur_dir,
    animstate: null,
    animation: "wounded_heavy_1"
  }
} as any;

copyTable(states, add_state_lib_animpoint());
copyTable(states, add_state_lib_scenario());
copyTable(states, add_state_lib_pri_a15());
