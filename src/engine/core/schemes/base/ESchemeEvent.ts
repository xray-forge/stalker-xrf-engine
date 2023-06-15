/**
 * todo;
 */
export enum ESchemeEvent {
  ACTIVATE_SCHEME = "activateScheme",
  DEACTIVATE = "deactivate", // todo: Rename to deactivate scheme
  DEATH = "onDeath",
  CUTSCENE = "onCutscene",
  EXTRAPOLATE = "onExtrapolate",
  NET_DESTROY = "net_destroy",
  HIT = "onHit",
  RESET_SCHEME = "resetScheme", // todo: Probably merge with activate scheme or rename it to activateRestrictorScheme
  SAVE = "save",
  UPDATE = "update",
  USE = "onUse",
  WAYPOINT = "onWaypoint",
}
