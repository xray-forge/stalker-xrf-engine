/**
 * Utility to get current filename, similar to __filename in nodejs.
 */
declare const $filename: string;

/**
 * Utility to declare global variables and extern them for game engine usage.
 * Declared values can be found in _G / global LUA scope.
 */
declare const extern: (key: string, value: unknown) => void;

/**
 * Utility to get global variables.
 * TSTL assumes that returned value is object with methods, cast it to function/module
 * with callbacks for correct usage.
 * todo: Remove after TS migration.
 */
declare const get_global: <T = any>(key: string) => T;
