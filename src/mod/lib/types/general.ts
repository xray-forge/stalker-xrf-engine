export type AnyObject = Record<string, any>;

export type Optional<T> = T | null;

export type Definable<T> = T | undefined;

export type Maybe<T> = T | undefined | null;

/**
 * Type-casted option that extends type with "nil" values.
 */
export type StringOptional<T extends string> = T | "nil";

export type PartialRecord<K extends keyof any, T> = {
  [P in K]?: T;
};

export type AnyArgs = Array<any>;

export type AnyCallable = (this: void, ...args: AnyArgs) => any;

export type AnyCallablesModule = Record<string, (this: void, ...args: AnyArgs) => any>;

export type TFolderFiles = string | Array<string | Array<string>>;

export type TFolderReplicationDescriptor = [string, string];

export interface IConstructor<T> {
  prototype: T;
  new (): T;
}
