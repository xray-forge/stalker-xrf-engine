import { Optional } from "@/mod/lib/types";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("utils/general");

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
 * function empty(container)
 *  if (type(container) == "function") then
 *    for i in container do
 *      return  (false)
 *    end
 *    return    (true)
 *  end
 *
 *  assert      (type(container) == "table")
 *
 *  if (container[1] ~= nil) then
 *    return    (false)
 *  end
 *
 *  for i,j in pairs(container) do
 *    return    (false)
 *  end
 *
 *  return      (true)
 * end
 */
export function isEmpty(container: any): boolean {
  log.info("Check is empty:", type(container), tostring(container));

  let isEmptyElement: boolean = true;

  if (container === null) {
    return isEmptyElement;
  }

  if (type(container) === "function") {
    forin(container, (acc, index, stop) => {
      isEmptyElement = false;
      stop();
    });

    return isEmptyElement;
  }

  assert(type(container) == "table");

  if (container[1] !== null) {
    return false;
  }

  log.info("Check is empty:", type(pairs(container)), tostring(pairs(container)));

  forin(pairs(container), (acc, index, stop) => {
    isEmptyElement = false;
    stop();
  });

  return isEmptyElement;
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

/**
 *
 * function yaw( v1, v2 )
 *  return  math.acos(
 *  ( (v1.x*v2.x) + (v1.z*v2.z ) ) / ( math.sqrt(v1.x*v1.x + v1.z*v1.z ) * math.sqrt(v2.x*v2.x + v2.z*v2.z ) )
 *  )
 * end
 */
export function yaw(v1: XR_vector, v2: XR_vector) {
  return lua_math.acos(
    (v1.x * v2.x + v1.z * v2.z) / (lua_math.sqrt(v1.x * v1.x + v1.z * v1.z) * lua_math.sqrt(v2.x * v2.x + v2.z * v2.z))
  );
}

/**
 *
 * function yaw_degree( v1, v2 )
 *  return  (
 *   math.acos(
 *   ( (v1.x*v2.x) + (v1.z*v2.z ) ) / ( math.sqrt(v1.x*v1.x + v1.z*v1.z ) * math.sqrt(v2.x*v2.x + v2.z*v2.z ) )
 *   ) * 57.2957
 *   )
 * end
 *
 */
export function yawDegree(v1: XR_vector, v2: XR_vector): number {
  return (
    lua_math.acos(
      (v1.x * v2.x + v1.z * v2.z) /
        (lua_math.sqrt(v1.x * v1.x + v1.z * v1.z) * lua_math.sqrt(v2.x * v2.x + v2.z * v2.z))
    ) * 57.2957
  );
}

/**
 * function yaw_degree3d( v1, v2 )
 *  return  (
 *  math.acos(
 *  (v1.x*v2.x + v1.y*v2.y + v1.z*v2.z) /
 *    (math.sqrt(v1.x*v1.x + v1.y*v1.y + v1.z*v1.z )*math.sqrt(v2.x*v2.x + v2.y*v2.y + v2.z*v2.z))
 *  )*57.2957
 *  )
 * end
 */
export function yawDegree3d(v1: XR_vector, v2: XR_vector): number {
  return (
    lua_math.acos(
      (v1.x * v2.x + v1.y * v2.y + v1.z * v2.z) /
        (lua_math.sqrt(v1.x * v1.x + v1.y * v1.y + v1.z * v1.z) *
          lua_math.sqrt(v2.x * v2.x + v2.y * v2.y + v2.z * v2.z))
    ) * 57.2957
  );
}

/**
 *
 * function vector_cross(v1, v2)
 *  return vector():set(v1.y  * v2.z  - v1.z  * v2.y, v1.z  * v2.x  - v1.x  * v2.z, v1.x  * v2.y  - v1.y  * v2.x)
 * end
 */
export function vectorCross(v1: XR_vector, v2: XR_vector): XR_vector {
  return new vector().set(v1.y * v2.z - v1.z * v2.y, v1.z * v2.x - v1.x * v2.z, v1.x * v2.y - v1.y * v2.x);
}

/**
 *
 * --������������ ������ ������ ��� y ������ ������� �������.
 * function vector_rotate_y(v, angle)
 *  angle = angle * 0.017453292519943295769236907684886
 *  local c = math.cos (angle)
 *  local s = math.sin (angle)
 *  return vector ():set (v.x * c - v.z * s, v.y, v.x * s + v.z * c)
 * end
 */
export function vectorRotateY(target: XR_vector, angle: number): XR_vector {
  // eslint-disable-next-line @typescript-eslint/no-loss-of-precision
  angle = angle * 0.017453292519943295769236907684886;

  const c = lua_math.cos(angle);
  const s = lua_math.sin(angle);

  return new vector().set(target.x * c - target.z * s, target.y, target.x * s + target.z * c);
}
