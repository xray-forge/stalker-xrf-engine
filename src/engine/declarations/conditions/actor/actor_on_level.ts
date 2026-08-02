import { level } from "xray16";
import { GameObject } from "xray16/alias";
import { extern, LuaArray, TName } from "xray16/lib";

/**
 * Check whether actor is on level with one of provided names.
 *
 * Where:
 * - levels - variadic list of level names to check.
 */
extern("xr_conditions.actor_on_level", (_: GameObject, __: GameObject, levels: LuaArray<TName>): boolean => {
  const currentLevelName: TName = level.name();

  for (const [, levelName] of pairs(levels)) {
    if (levelName === currentLevelName) {
      return true;
    }
  }

  return false;
});
