export enum EStateManagerOperator {
  end = 1,
  locked = 2,
  locked_external = 3,
  locked_animation = 4,
  locked_animstate = 5,
  locked_smartcover = 6,

  weapon_strapp = 11,
  weapon_unstrapp = 12,
  weapon_none = 13,
  weapon_fire = 14,
  weapon_drop = 15,

  movement = 21,
  movement_walk = 22,
  movement_run = 23,
  movement_stand = 24,
  movement_walk_turn = 25,
  movement_walk_search = 26,
  movement_stand_turn = 27,
  movement_stand_search = 28,
  movement_run_turn = 29,
  movement_run_search = 30,

  mental_free = 31,
  mental_danger = 32,
  mental_panic = 33,

  bodystate_crouch = 41,
  bodystate_standing = 42,
  bodystate_crouch_danger = 43,
  bodystate_standing_free = 44,

  direction_turn = 51,
  direction_search = 52,

  animstate_start = 61,
  animstate_stop = 62,

  animation_start = 71,
  animation_stop = 72,

  walk_turn = 75,
  walk_search = 76,
  stand_turn = 77,
  stand_search = 78,

  smartcover_enter = 80,
  smartcover_exit = 81
}
