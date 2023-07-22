import { anim, CSightParams, move } from "xray16";

import { IStateDescriptor } from "@/engine/core/objects/state/state_types";

/**
 *
 */
export const priA15States: LuaTable<string, IStateDescriptor> = {
  pri_a15_idle_none: {
    weapon: "none",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_idle_none",
    direction: CSightParams.eSightTypeAnimationDirection,
  },
  pri_a15_idle_strap: {
    weapon: "strapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_idle_none",
    direction: CSightParams.eSightTypeAnimationDirection,
  },
  pri_a15_idle_unstrap: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_idle_unstrap",
    direction: CSightParams.eSightTypeAnimationDirection,
  },
  // --Vano
  pri_a15_vano_all: {
    weapon: "none",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_vano_all",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_vano_1_sokolov: {
    weapon: "none",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_vano_1_sokolov",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_vano_1_zulus: {
    weapon: "none",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_vano_1_zulus",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_vano_1_wanderer: {
    weapon: "none",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_vano_1_wanderer",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_vano_2_sokolov_zulus: {
    weapon: "none",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_vano_2_sokolov_zulus",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_vano_2_sokolov_wanderer: {
    weapon: "none",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_vano_2_sokolov_wanderer",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_vano_2_zulus_wanderer: {
    weapon: "none",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_vano_2_zulus_wanderer",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_vano_3_vano_alive: {
    weapon: "none",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_vano_3_vano_alive",
    direction: CSightParams.eSightTypeAnimationDirection,
  },
  // --Sokolov
  pri_a15_sokolov_all: {
    weapon: "none",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_sokolov_all",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_sokolov_1_vano: {
    weapon: "none",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_sokolov_1_vano",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_sokolov_1_zulus: {
    weapon: "none",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_sokolov_1_zulus",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_sokolov_1_wanderer: {
    weapon: "none",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_sokolov_1_wanderer",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_sokolov_2_vano_zulus: {
    weapon: "none",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_sokolov_2_vano_zulus",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_sokolov_2_vano_wanderer: {
    weapon: "none",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_sokolov_2_vano_wanderer",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_sokolov_2_zulus_wanderer: {
    weapon: "none",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_sokolov_2_zulus_wanderer",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_sokolov_3_sokolov_alive: {
    weapon: "none",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_sokolov_3_sokolov_alive",
    direction: CSightParams.eSightTypeAnimationDirection,
  },
  // --Zulus
  pri_a15_zulus_all: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_zulus_all",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_zulus_1_vano: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_zulus_1_vano",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_zulus_1_sokolov: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_zulus_1_sokolov",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_zulus_1_wanderer: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_zulus_1_wanderer",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_zulus_2_vano_sokolov: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_zulus_2_vano_sokolov",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_zulus_2_vano_wanderer: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_zulus_2_vano_wanderer",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_zulus_2_sokolov_wanderer: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_zulus_2_sokolov_wanderer",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_zulus_3_zulus_alive: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_zulus_3_zulus_alive",
    direction: CSightParams.eSightTypeAnimationDirection,
  },
  // --Wanderer
  pri_a15_wanderer_all: {
    weapon: "none",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_wanderer_all",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_wanderer_1_vano: {
    weapon: "none",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_wanderer_1_vano",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_wanderer_1_sokolov: {
    weapon: "none",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_wanderer_1_sokolov",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_wanderer_1_zulus: {
    weapon: "none",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_wanderer_1_zulus",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_wanderer_2_vano_sokolov: {
    weapon: "none",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_wanderer_2_vano_sokolov",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_wanderer_2_vano_zulus: {
    weapon: "none",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_wanderer_2_vano_zulus",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_wanderer_2_sokolov_zulus: {
    weapon: "none",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_wanderer_2_sokolov_zulus",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_wanderer_3_wanderer_alive: {
    weapon: "none",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_wanderer_3_wanderer_alive",
    direction: CSightParams.eSightTypeAnimationDirection,
  },
  // -- Actor
  pri_a15_actor_all: {
    weapon: "none",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_actor_all",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_actor_1_vano: {
    weapon: "none",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_actor_1_vano",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_actor_1_sokolov: {
    weapon: "none",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_actor_1_sokolov",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_actor_1_zulus: {
    weapon: "none",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_actor_1_zulus",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_actor_1_wanderer: {
    weapon: "none",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_actor_1_wanderer",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_actor_2_vano_sokolov: {
    weapon: "none",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_actor_2_vano_sokolov",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_actor_2_vano_zulus: {
    weapon: "none",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_actor_2_vano_zulus",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_actor_2_vano_wanderer: {
    weapon: "none",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_actor_2_vano_wanderer",
    direction: CSightParams.eSightTypeAnimationDirection,
  },
  pri_a15_actor_2_sokolov_zulus: {
    weapon: "none",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_actor_2_sokolov_zulus",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_actor_2_sokolov_wanderer: {
    weapon: "none",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_actor_2_sokolov_wanderer",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_actor_2_zulus_wanderer: {
    weapon: "none",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_actor_2_zulus_wanderer",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_actor_3_vano_alive: {
    weapon: "none",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_actor_3_vano_alive",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_actor_3_sokolov_alive: {
    weapon: "none",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_actor_3_sokolov_alive",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_actor_3_zulus_alive: {
    weapon: "none",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_actor_3_zulus_alive",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_actor_3_wanderer_alive: {
    weapon: "none",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_actor_3_wanderer_alive",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_actor_all_dead: {
    weapon: "none",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_actor_all_dead",
    direction: CSightParams.eSightTypeAnimationDirection,
  },
  // -- Military Tarasov
  pri_a15_military_tarasov_all: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_military_tarasov_all",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_military_tarasov_1_vano: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_military_tarasov_1_vano",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_military_tarasov_1_sokolov: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_military_tarasov_1_sokolov",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_military_tarasov_1_zulus: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_military_tarasov_1_zulus",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_military_tarasov_1_wanderer: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_military_tarasov_1_wanderer",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_military_tarasov_2_vano_sokolov: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_military_tarasov_2_vano_sokolov",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_military_tarasov_2_vano_zulus: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_military_tarasov_2_vano_zulus",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_military_tarasov_2_vano_wanderer: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_military_tarasov_2_vano_wanderer",
    direction: CSightParams.eSightTypeAnimationDirection,
  },
  pri_a15_military_tarasov_2_sokolov_zulus: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_military_tarasov_2_sokolov_zulus",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_military_tarasov_2_sokolov_wanderer: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_military_tarasov_2_sokolov_wanderer",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_military_tarasov_2_zulus_wanderer: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_military_tarasov_2_zulus_wanderer",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_military_tarasov_3_vano_alive: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_military_tarasov_3_vano_alive",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_military_tarasov_3_sokolov_alive: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_military_tarasov_3_sokolov_alive",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_military_tarasov_3_zulus_alive: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_military_tarasov_3_zulus_alive",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_military_tarasov_3_wanderer_alive: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_military_tarasov_3_wanderer_alive",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_military_tarasov_all_dead: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_military_tarasov_all_dead",
    direction: CSightParams.eSightTypeAnimationDirection,
  },
  // -- Military 2
  pri_a15_military_2_all: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_military_2_all",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_military_2_1_vano: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_military_2_1_vano",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_military_2_1_sokolov: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_military_2_1_sokolov",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_military_2_1_zulus: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_military_2_1_zulus",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_military_2_1_wanderer: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_military_2_1_wanderer",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_military_2_2_vano_sokolov: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_military_2_2_vano_sokolov",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_military_2_2_vano_zulus: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_military_2_2_vano_zulus",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_military_2_2_vano_wanderer: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_military_2_2_vano_wanderer",
    direction: CSightParams.eSightTypeAnimationDirection,
  },
  pri_a15_military_2_2_sokolov_zulus: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_military_2_2_sokolov_zulus",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_military_2_2_sokolov_wanderer: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_military_2_2_sokolov_wanderer",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_military_2_2_zulus_wanderer: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_military_2_2_zulus_wanderer",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_military_2_3_vano_alive: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_military_2_3_vano_alive",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_military_2_3_sokolov_alive: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_military_2_3_sokolov_alive",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_military_2_3_zulus_alive: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_military_2_3_zulus_alive",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_military_2_3_wanderer_alive: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_military_2_3_wanderer_alive",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_military_2_all_dead: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_military_2_all_dead",
    direction: CSightParams.eSightTypeAnimationDirection,
  },
  // -- Military 3
  pri_a15_military_3_all: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_military_3_all",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_military_3_1_vano: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_military_3_1_vano",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_military_3_1_sokolov: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_military_3_1_sokolov",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_military_3_1_zulus: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_military_3_1_zulus",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_military_3_1_wanderer: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_military_3_1_wanderer",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_military_3_2_vano_sokolov: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_military_3_2_vano_sokolov",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_military_3_2_vano_zulus: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_military_3_2_vano_zulus",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_military_3_2_vano_wanderer: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_military_3_2_vano_wanderer",
    direction: CSightParams.eSightTypeAnimationDirection,
  },
  pri_a15_military_3_2_sokolov_zulus: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_military_3_2_sokolov_zulus",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_military_3_2_sokolov_wanderer: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_military_3_2_sokolov_wanderer",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_military_3_2_zulus_wanderer: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_military_3_2_zulus_wanderer",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_military_3_3_vano_alive: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_military_3_3_vano_alive",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_military_3_3_sokolov_alive: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_military_3_3_sokolov_alive",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_military_3_3_zulus_alive: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_military_3_3_zulus_alive",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_military_3_3_wanderer_alive: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_military_3_3_wanderer_alive",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_military_3_all_dead: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_military_3_all_dead",
    direction: CSightParams.eSightTypeAnimationDirection,
  },
  // -- Military 4
  pri_a15_military_4_all: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_military_4_all",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_military_4_1_vano: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_military_4_1_vano",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_military_4_1_sokolov: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_military_4_1_sokolov",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_military_4_1_zulus: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_military_4_1_zulus",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_military_4_1_wanderer: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_military_4_1_wanderer",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_military_4_2_vano_sokolov: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_military_4_2_vano_sokolov",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_military_4_2_vano_zulus: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_military_4_2_vano_zulus",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_military_4_2_vano_wanderer: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_military_4_2_vano_wanderer",
    direction: CSightParams.eSightTypeAnimationDirection,
  },
  pri_a15_military_4_2_sokolov_zulus: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_military_4_2_sokolov_zulus",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_military_4_2_sokolov_wanderer: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_military_4_2_sokolov_wanderer",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_military_4_2_zulus_wanderer: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_military_4_2_zulus_wanderer",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_military_4_3_vano_alive: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_military_4_3_vano_alive",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_military_4_3_sokolov_alive: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_military_4_3_sokolov_alive",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_military_4_3_zulus_alive: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_military_4_3_zulus_alive",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_military_4_3_wanderer_alive: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_military_4_3_wanderer_alive",
    direction: CSightParams.eSightTypeAnimationDirection,
  },

  pri_a15_military_4_all_dead: {
    weapon: "unstrapped",
    movement: move.stand,
    mental: anim.free,
    bodystate: move.standing,
    animstate: null,
    animation: "pri_a15_military_4_all_dead",
    direction: CSightParams.eSightTypeAnimationDirection,
  },
} as any;
