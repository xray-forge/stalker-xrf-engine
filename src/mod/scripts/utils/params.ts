import { Optional } from "@/mod/lib/types";
import { scriptIds } from "@/mod/scripts/core/db";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("utils/unknown");

/**
 * todo;
 */
export function getParamString(srcString: string, obj: XR_game_object): LuaMultiReturn<[string, boolean]> {
  const scriptId = scriptIds[obj.id()];
  const [outString, num] = string.gsub(srcString, "%$script_id%$", tostring(scriptId));

  if (num > 0) {
    return $multi(outString, true);
  } else {
    return $multi(srcString, false);
  }
}

/**
 * todo;
 */
export function parseNames(str: string): Record<string, unknown> {
  const names = {};

  for (const it of string.gfind(str, "([%w_%-.\\]+)%p*")) {
    table.insert(names, it);
  }

  return names;
}

/**
 * todo;
 */
export function parseKeyValue(str: Optional<string>): Optional<Record<string, string>> {
  if (str === null) {
    return null;
  }

  const container: Record<string, string> = {};
  let key: Optional<string> = null;

  for (const name of string.gfind(str, "([%w_\\]+)%p*")) {
    if (key === null) {
      key = name;
    } else {
      container[key] = name;
      key = null;
    }
  }

  return container;
}

/**
 * todo;
 */
export function parseNums(str: string): Record<string, unknown> {
  const container: Record<string, string> = {};

  for (const it of string.gfind(str, "([%-%d%.]+)%,*")) {
    table.insert(container, tonumber(it));
  }

  return container;
}
