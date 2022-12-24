import { AnyObject, Optional } from "@/mod/lib/types";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("utils/general");

/**
 * Check if provided container is empty collection.
 * Very lua-specific checks, do not apply TS logic here.
 */
export function isEmpty(container: Optional<LuaIterable<any>>): boolean {
  if (container === null) {
    return true;
  }

  if (type(container) === "function") {
    for (const it of container) {
      return false;
    }

    return true;
  }

  assert(type(container) == "table");

  if ((container as AnyObject)[1] !== null) {
    return false;
  }

  for (const [k, v] of pairs(container)) {
    return false;
  }

  return true;
}

/**
 * todo: description
 */
export function round(value: number): number {
  const min: number = math.floor(value);
  const max: number = min + 1;

  return value - min >= max - value ? max : min;
}

/**
 * todo: description
 * todo: Probably unused
 */
export function add(x: number): boolean {
  return math.floor(x * 0.5) * 2 === math.floor(x);
}

/**
 * todo: description
 */
export function ifThenElse<A, B>(condition: boolean, ifTrue: A, ifFalse: B): A | B {
  return condition ? ifTrue : ifFalse;
}

/**
 * todo: description
 */
export function randomChoice<T>(...args: Array<T>): T {
  return args[math.random(0, args.length - 1)];
}

/**
 * todo: description
 * - Probably needs improvement since seed is same if calls happening almost instantly, needs nanotime or different seed
 */
export function randomNumber(min?: number, max?: number): number {
  math.randomseed(device().time_global());

  if (min === null && max === null) {
    return math.random();
  } else {
    return math.random(min, max);
  }
}

/**
 * todo: description
 */
export function clearTable(tbl: LuaTable): void {
  while (tbl.length() !== 0) {
    table.remove(tbl, tbl.length());
  }
}

/**
 * -- ��������� ������ � ������.
 * function vec_to_str (vector)
 *  if vector == nil then return "nil" end
 *  return string.format("[%s:%s:%s]", vector.x, vector.y, vector.z)
 * end
 */
export function vectorToString(vector: Optional<XR_vector>): Optional<string> {
  if (vector === null) {
    return null;
  }

  return string.format("[%s:%s:%s]", vector.x, vector.y, vector.z);
}

/**
 *
 * function parse_names( s )
 *  local t = {}
 *  for name in string.gfind( s, "([%w_\\]+)%p*" ) do
 *    --for name in string.gfind( s, "%s*([^%,]+)%s*" ) do
 *    table.insert( t, name )
 *  end
 *  return t
 * end
 */
export function parseNames(str: string): Record<string, unknown> {
  const t = {};

  for (const it of string.gfind(str, "([%w_\\]+)%p*")) {
    table.insert(t, it);
  }

  return t;
}

/**
 *
 * function parse_key_value( s )
 *  local t = {}
 *
 *  if s == nil then
 *    return nil
 *  end
 *
 *  local key, nam = nil, nil
 *
 *  for name in string.gfind( s, "([%w_\\]+)%p*" ) do
 *    if key == nil then
 *      key = name
 *    else
 *      t[key] = name
 *      key = nil
 *    end
 *  end
 *
 *  return t
 * end
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
 * function parse_nums( s )
 *  local t = {}
 *
 *  for entry in string.gfind( s, "([%-%d%.]+)%,*" ) do
 *    table.insert( t, tonumber( entry ) )
 *  end
 *
 *  return t
 * end
 */
export function parseNums(str: string): Record<string, unknown> {
  const container: Record<string, string> = {};

  for (const it of string.gfind(str, "([%-%d%.]+)%,*")) {
    table.insert(container, tonumber(it));
  }

  return container;
}
