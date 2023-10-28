export const smartTerrainConfig = {
  // Timeout for smart terrain controlled base (like Yanov).
  ALARM_SMART_TERRAIN_BASE: 2 * 60 * 60,
  // Timeout for smart terrain generic alarm.
  ALARM_SMART_TERRAIN_GENERIC: 6 * 60 * 60,
  // Throttle updates on death.
  DEATH_IDLE_TIME: 600,
  // Time between respawn attempts for smart terrain.
  RESPAWN_IDLE: 1_000,
  // Distance to consider smart as visited.
  VISITED_DISTANCE: 50,
  VISITED_DISTANCE_SQR: 2_500, // 50 * 50
  // Restrict spawn of objects in radius.
  RESPAWN_RADIUS_RESTRICTION: 150,
  RESPAWN_RADIUS_RESTRICTION_SQR: 150 * 150,
  DEFAULT_ARRIVAL_DISTANCE: 25,
  // Configuration of possible smart terrain jobs.
  JOBS: {
    MOB_HOME: {
      PRIORITY: 10,
      COUNT: 20,
      MIN_RADIUS: 10,
      MID_RADIUS: 20,
      MAX_RADIUS: 70,
    },
    STALKER_ANIMPOINT: {
      PRIORITY: 15,
    },
    STALKER_CAMPER: {
      PRIORITY: 45,
    },
    STALKER_COLLECTOR: {
      PRIORITY: 25,
    },
    STALKER_GUARD: {
      PRIORITY: 25,
      PRIORITY_FOLLOWER: 24,
    },
    STALKER_PATROL: {
      PRIORITY: 20,
    },
    STALKER_POINT: {
      PRIORITY: 3,
      COUNT: 20,
      MIN_RADIUS: 3,
      MAX_RADIUS: 8,
    },
    STALKER_SURGE: {
      PRIORITY: 50,
    },
    STALKER_SLEEP: {
      PRIORITY: 10,
    },
    STALKER_SNIPER: {
      PRIORITY: 30,
    },
    STALKER_WALKER: {
      PRIORITY: 15,
    },
  },
};
