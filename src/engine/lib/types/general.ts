import { TIndex } from "@/engine/lib/types/alias";

/**
 * Any object from JS record variant.
 */
export type AnyObject = Record<string, any>;

/**
 * Nullable value.
 *
 *  @deprecated In favor of `Nillable`.
 */
export type Optional<T> = T | null;

/**
 * Possible `nil` value in lua, both null and undefined in TS.
 */
export type Nillable<T> = T | undefined | null;

/**
 * Type-casted option that extends type with "nil" values.
 */
export type StringNillable<T extends string = string> = T | "nil";

/**
 * Record partial to support enum implementations with subsets of available keys.
 */
export type PartialRecord<K extends keyof any, T> = {
  [P in K]?: T;
};

export type AnyContextualCallable<T = unknown> = (this: T, ...args: AnyArgs) => any;

export type AnyCallable = (this: void, ...args: AnyArgs) => any;

export type AnyCallablesModule = Record<string, (this: void, ...args: AnyArgs) => any>;

export interface IConstructor<T> {
  prototype: T;
  new (...args: AnyArgs): T;
}

export type LuaArray<T> = LuaTable<TIndex, T>;

export type AnyArgs = Array<any>;
