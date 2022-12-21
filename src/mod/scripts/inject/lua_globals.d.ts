/**
 * Utility to declare global variables.
 */
declare const declare_global: (key: string, value: unknown) => void;

/**
 * Utility to get global variables.
 */
declare const get_global: <T = any>(key: string) => T;

/**
 * Binding of native lua table interface.
 */
declare const lua_string: LUA_String;

/**
 * Binding of native lua string interface.
 */
declare const lua_table: LUA_Table;

/**
 * Binding of implemented class defining function.
 * todo: Infer + more type safety.
 */
declare const declare_xr_class: <T, B extends abstract new () => any>(
  name: string,
  base?: B | null,
  implementation?: Partial<T>
) => T & InstanceType<B>;

/**
 * Binding of implemented class creation function.
 */
declare const create_xr_class_instance: <T>(it: T, ...params: Array<any>) => T;

/**
 * Injected by TSTL plugin.
 * Allows 'super()' injecting from lua.
 * Without plugin, it conflicts with javascript constructor super.
 */
declare const xr_class_super: (...args: Array<unknown>) => void;

/**
 * Pack parameters for tuple usage in typescript.
 * Example: const [a, b, c] = pack_table(multi_return_lua_function());
 */
declare const pack_table: (...args: Array<any>) => Array<any>;
