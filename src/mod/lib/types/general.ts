export type AnyObject = Record<string, any>;

export type Optional<T> = T | null;

export type Definable<T> = T | undefined;

export type Maybe<T> = T | undefined | null;

export type AnyArgs = Array<any>;

export type AnyCallable = (this: void, ...args: AnyArgs) => any;

export type TFolderFiles = string | Array<string | Array<string>>;

export type TFolderReplicationDescriptor = [string, string];
