/**
 * Utility to declare global variables.
 * Declared values can be found in _G / global LUA scope.
 */
declare const declare_global: (key: string, value: unknown) => void;

/**
 * Utility to get global variables.
 * TSTL assumes that returned value is object with methods, cast it to function/module with callbacks for correct usage.
 * todo: Remove after TS migration.
 */
declare const get_global: <T = any>(key: string) => T;

/**
 * Utility to get current filename, similar to __filename in nodejs.
 */
declare const $filename: string;
