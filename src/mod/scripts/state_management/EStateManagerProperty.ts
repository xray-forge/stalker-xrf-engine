export enum EStateManagerProperty {
  end = 1,
  locked = 2,
  locked_external = 3,

  // -- WEAPON
  weapon = 11,
  weapon_locked = 12,
  weapon_strapped = 13,
  weapon_strapped_now = 14,
  weapon_unstrapped = 15,
  weapon_unstrapped_now = 16,
  weapon_none = 17,
  weapon_none_now = 18,
  weapon_drop = 19,
  weapon_fire = 20,

  // -- MOVEMENT
  movement = 21,
  movement_walk = 22,
  movement_run = 23,
  movement_stand = 24,
  movement_stand_now = 25,

  // -- MENTAL STATES
  mental = 31,
  mental_free = 32,
  mental_free_now = 33,
  mental_danger = 34,
  mental_danger_now = 35,
  mental_panic = 36,
  mental_panic_now = 37,

  // -- BODYSTATES
  bodystate = 41,
  bodystate_crouch = 42,
  bodystate_standing = 43,
  bodystate_crouch_now = 44,
  bodystate_standing_now = 45,

  // -- DIRECTION
  direction = 51,
  direction_search = 52,

  // -- ANIMSTATE
  animstate = 61,
  animstate_locked = 62,
  animstate_idle_now = 64,
  animstate_play_now = 66,

  // -- ANIMATION
  animation = 81,
  animation_locked = 82,
  animation_play_now = 84,
  animation_none_now = 86,

  // -- SMARTCOVER
  smartcover_need = 90,
  smartcover = 91,
  in_smartcover = 92
  // --    smartcover_locked]           = 92,
}
