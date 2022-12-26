/**
 * Utility to declare global variables.
 */
declare const declare_global: (key: string, value: unknown) => void;

/**
 * Utility to get global variables.
 * todo: Probably remove after TS migration.
 */
declare const get_global: <T = any>(key: string) => T;

/**
 * Binding of implemented class defining function.
 * todo: Infer + more type safety.
 */
declare const declare_xr_class: <T, B extends abstract new (...args: Array<any>) => any>(
  name: string,
  base?: B | null,
  implementation?: Partial<T>
) => T & InstanceType<B>;

/**
 * Binding of implemented class creation function.
 * todo: Infer + InstanceType<T> generic.
 */
declare const create_xr_class_instance: <T>(it: T, ...params: Array<any>) => T;

/**
 * Injected by TSTL plugin.
 * Allows 'super()' injecting from lua.
 * Without plugin, it conflicts with javascript constructor super.
 */
declare const xr_class_super: <T = any>(...args: Array<unknown>) => T;
