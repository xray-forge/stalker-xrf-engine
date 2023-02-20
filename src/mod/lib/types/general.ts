/**
 * Any object from JS record variant.
 */
export type AnyObject = Record<string, any>;

/**
 * Nullable value.
 */
export type Optional<T> = T | null;

export type Maybe<T> = T | undefined | null;

/**
 * Type-casted option that extends type with "nil" values.
 */
export type StringOptional<T extends string = string> = T | "nil";

/**
 * Record partial to support enum implementations with subsets of available keys.
 */
export type PartialRecord<K extends keyof any, T> = {
  [P in K]?: T;
};

export type AnyCallable = (this: void, ...args: AnyArgs) => any;

export type AnyCallablesModule = Record<string, (this: void, ...args: AnyArgs) => any>;

export type TFolderFiles = string | Array<string | Array<string>>;

export type TFolderReplicationDescriptor = [string, string];

export interface IConstructor<T> {
  prototype: T;
  new (): T;
}

export type LuaArray<T> = LuaTable<number, T>;

export type AnyArgs = Array<any>;

export type LuaAnyArgs = LuaArray<any>;

/**
 * String based name.
 */
export type TName = string;

/**
 * Number based identifier.
 */
export type TNumberId = number;

/**
 * String based identifier.
 */
export type TStringId = string;
