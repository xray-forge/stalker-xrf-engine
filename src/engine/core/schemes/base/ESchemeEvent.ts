/**
 * todo;
 */
export enum ESchemeEvent {
  ACTIVATE_SCHEME = "activateScheme",
  DEACTIVATE = "deactivate",
  DEATH = "death_callback",
  CUTSCENE = "cutscene_callback",
  EXTRAPOLATE = "extrapolate_callback",
  NET_DESTROY = "net_destroy",
  HIT = "hit_callback",
  RESET_SCHEME = "resetScheme", // todo: Probably merge with activate scheme.
  SAVE = "save",
  UPDATE = "update",
  USE = "use_callback",
  WAYPOINT = "waypoint_callback",
}
