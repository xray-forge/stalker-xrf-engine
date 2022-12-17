declare interface LUA_String {

  byte(this: void, s: unknown, i: unknown, j: unknown): unknown;

  char(this: void, ...rest: Array<unknown>): unknown;

  dump(this: void, func: unknown, strip: unknown): unknown;

  find(this: void, s: unknown, pattern: unknown, init: unknown, plain: unknown): unknown;

  format(this: void, formatstring: string, ...rest: Array<string>): string;

  gmatch(this: void, s: unknown, pattern: unknown): unknown;

  gsub(this: void, s: unknown, pattern: unknown, repl: unknown, n: unknown): unknown;

  len(this: void, s: unknown): unknown;

  lower(this: void, s: unknown): unknown;

  match(this: void, s: unknown, pattern: unknown, init: unknown): unknown;

  pack(this: void, fmt: unknown, v1: unknown, v2: unknown, ...rest: Array<unknown>): unknown;

  packsize(this: void, fmt: unknown): unknown;

  rep(this: void, s: unknown, n: unknown, sep: unknown): unknown;

  reverse(this: void, s: unknown): unknown;

  sub(this: void, s: unknown, i: unknown, j: unknown): unknown;

  unpack(this: void, fmt: unknown, s: unknown, pos: unknown): unknown;

  upper(this: void, s: unknown): unknown;

}

/**
 * Cast value to string.
 */
declare const tostring: (value: any) => string;

/**
 * Get type of value.
 */
declare const type: (value: any) => string;
