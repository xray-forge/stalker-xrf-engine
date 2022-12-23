declare interface LUA_String {
  byte(this: void, s: unknown, i: unknown, j: unknown): unknown;

  char(this: void, ...rest: Array<unknown>): unknown;

  dump(this: void, func: unknown, strip: unknown): unknown;

  find(this: void, s: string, pattern: unknown, init?: number, plain?: boolean): number | null;

  format(this: void, formatstring: string, ...rest: Array<string | number>): string;

  gmatch(this: void, s: unknown, pattern: unknown): unknown;

  gsub(this: void, s: string, pattern: string, repl: string, n?: unknown): string;

  len(this: void, str: string): number;

  lower(this: void, s: unknown): unknown;

  match(this: void, s: unknown, pattern: unknown, init: unknown): unknown;

  pack(this: void, fmt: unknown, v1: unknown, v2: unknown, ...rest: Array<unknown>): unknown;

  packsize(this: void, fmt: unknown): unknown;

  rep(this: void, s: unknown, n: unknown, sep: unknown): unknown;

  reverse(this: void, s: unknown): unknown;

  sub(this: void, str: string, i: number, j: number): string;

  unpack(this: void, fmt: unknown, s: unknown, pos: unknown): unknown;

  upper(this: void, s: unknown): unknown;
}

declare interface LUA_Table {
  concat(this: void, list: unknown, sep: unknown, i: unknown, j: unknown): unknown;

  insert(this: void, list: unknown, pos: unknown, value: unknown): unknown;

  move(this: void, a1: unknown, f: unknown, e: unknown, t: unknown, a2: unknown): unknown;

  remove(this: void, list: unknown, pos: unknown): unknown;

  sort(this: void, list: unknown, comp: unknown): unknown;
}

declare interface LUA_Math {
  pi: number

  abs(this: void, x: number): unknown

  acos(this: void, x: number): unknown

  asin(this: void, x: number): unknown

  atan(this: void, y: number, x: number): unknown

  ceil(this: void, x: number): unknown

  cos(this: void, x: number): unknown

  deg(this: void, x: number): unknown

  exp(this: void, x: number): unknown

  floor(this: void, x: number): number

  fmod(this: void, x: number, y: number): unknown

  log(this: void, x: number, base: number): unknown

  max(this: void, x: number, ...args: Array<number>): unknown

  min(this: void, x: number, ...args: Array<number>): unknown

  mod(this: void, x: number, base: number): number

  modf(this: void, x: number): unknown

  rad(this: void, x: number): unknown

  random(this: void, m: number, n: number): unknown

  randomseed(this: void, x: number): unknown

  sin(this: void, x: number): unknown

  sqrt(this: void, x: number): unknown

  tan(this: void, x: number): unknown

  tointeger(this: void, x: number): unknown

  type(this: void, x: number): unknown

  ult(this: void, m: number, n: number): unknown
}

/**
 * Cast value to string.
 */
declare const tostring: (value: any) => string;

/**
 * Get type of value.
 */
declare const type: (value: any) => string;

declare const require: (modulePath: string) => any;
