import { MonsterHitInfo } from "xray16";
import { GameObject } from "xray16/alias";
import { extern } from "xray16/lib";
import { $isNotNil } from "xray16/macros";

/**
 * Whether monster was hit recently.
 */
extern("xr_conditions.mob_was_hit", (_: GameObject, object: GameObject): boolean => {
  const hitInfo: MonsterHitInfo = object.get_monster_hit_info();

  return $isNotNil(hitInfo.who) && hitInfo.time !== 0;
});
