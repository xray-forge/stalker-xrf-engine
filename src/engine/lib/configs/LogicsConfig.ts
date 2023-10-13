/**
 * Configuration of game logics.
 * todo: move to LTX file once everything is combined here.
 */
export const logicsConfig = {
  ALIFE: {
    OBJECT_INITIAL_SPAWN_BUFFER_TIME: 2_000,
    OBJECTS_PER_UPDATE: 20,
  },
  ACTOR_VISIBILITY_FRUSTUM: 35,
  ARTEFACT_OFFLINE_DISTANCE: 150,
  ARTEFACT_OFFLINE_DISTANCE_SQR: 150 * 150,
  ITEMS: {
    DROPPED_WEAPON_STATE_DEGRADATION: {
      MIN: 40,
      MAX: 80,
    },
  },
  SQUAD: {
    STAY_POINT_IDLE_MIN: 180 * 60,
    STAY_POINT_IDLE_MAX: 300 * 60,
  },
  MONSTER_CAPTURE_SCRIPT_NAME: "xrf",
} as const;
