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

  for (const _ of pairs(container)) {
    return false;
  }

  return true;
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

  return lua_string.format("[%s:%s:%s]", vector.x, vector.y, vector.z);
}

/**
 *
 * function round (value)
 *  local min = math.floor (value)
 *  local max = min + 1
 *
 *  if value - min > max - value then return max end
 *  return min
 * end
 */
export function round(value: number): number {
  const min: number = lua_math.floor(value);
  const max: number = min + 1;

  if (value - min > max - value) {
    return max;
  }

  return min;
}

/**
 * -- ��������� ����� ����� ����� �� ����������
 * function odd( x )
 *  return math.floor( x * 0.5 ) * 2 == math.floor( x )
 * end
 */
export function add(x: number): boolean {
  return lua_math.floor(x * 0.5) * 2 === lua_math.floor(x);
}

/**
 * function if_then_else(cond, if_true, if_false)
 *  if cond then
 *    return if_true
 *  end
 *  return if_false
 * end
 */
export function ifThenElse<A, B>(condition: boolean, ifTrue: A, ifFalse: B): A | B {
  return condition ? ifTrue : ifFalse;
}

/**
 * function random_choice(...)
 *  local arg = {...}
 *  local r = math.random(1, #arg)
 *  return arg[r]
 * end
 */
export function randomChoice(...args: Array<any>): any {
  const index: number = lua_math.random(1, args.length);

  return args[index];
}

/**
 *
 * function random_number (min_value, max_value)
 *  math.randomseed (device ():time_global ())
 *  if min_value == nil and max_value == nil then
 *    return math.random ()
 *  else
 *    return math.random (min_value, max_value)
 *  end
 * end
 */
export function randomNumber(min: number, max: number): number {
  lua_math.randomseed(device().time_global());

  if (min === null && max === null) {
    return lua_math.random();
  } else {
    return lua_math.random(min, max);
  }
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

  forin(lua_string.gfind(str, "([%w_\\]+)%p*"), (it) => {
    lua_table.insert(t, it);
  });

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

  forin(lua_string.gfind(str, "([%w_\\]+)%p*"), (name: string) => {
    if (key === null) {
      key = name;
    } else {
      container[key] = name;
      key = null;
    }
  });

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

  forin(lua_string.gfind(str, "([%-%d%.]+)%,*"), (entry) => {
    lua_table.insert(container, tonumber(entry));
  });

  return container;
}
