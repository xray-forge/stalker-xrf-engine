import { GameObject } from "xray16/alias";
import { extern, LuaArray, TCount, TName } from "xray16/lib";

/**
 * Check if object name matches one of provided parameters.
 *
 * Where:
 * - parameters - variadic list of strings to match object name.
 */
extern("xr_conditions.check_npc_name", (_: GameObject, object: GameObject, params: LuaArray<TName>): boolean => {
  const objectName: TName = object.name();
  const paramsCount: TCount = params.length();

  for (let index: TCount = 1; index <= paramsCount; index += 1) {
    const name: TName = params.get(index);

    if (string.find(objectName, name, 1, true)[0]) {
      return true;
    }
  }

  return false;
});
