/**
 * Extension methods for table.
 */
declare namespace table {
  /**
   * Get random value from table.
   * Provided by lua extensions lib in open-xray.
   *
   * @returns random value from table
   */
  function random<K extends AnyNotNil, V>(list: LuaTable<K, V>): V;
  /**
   * Get table size.
   * Provided by lua extensions lib in open-xray.
   *
   * @returns table size
   */
  function size<V>(list: Array<V>): number;
  function size<V extends string = string>(list: Record<V, unknown>): number;
  function size<K extends AnyNotNil, V>(list: LuaTable<K, V>): number;
  /**
   * Get table keys.
   * Provided by lua extensions lib in open-xray.
   *
   * @returns list of keys in an unordered way
   */
  function keys<K extends AnyNotNil, V>(list: LuaTable<K, V>): LuaTable<number, K>;
  /**
   * Get table values.
   * Provided by lua extensions lib in open-xray.
   *
   * @returns list of values in an unordered way
   */
  function values<K extends AnyNotNil, V>(list: LuaTable<K, V>): LuaTable<number, V>;
}

/**
 * Extension methods for string.
 */
declare namespace string {
  /**
   * Trim all spaces from both sides of string.
   */
  function trim(value: string): string;
  /**
   * Trim spaces from left side of string.
   */
  function trim_l(value: string): string;
  /**
   * Trim spaces from right side of string.
   */
  function trim_r(value: string): string;
  /**
   * Trim everything separated by spaces from first text entry.
   */
  function trim_w(value: string): string;
}
