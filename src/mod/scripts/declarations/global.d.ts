import { XR_game_object, XR_object_factory } from "xray16";

declare global {
  /**
   * todo;
   */
  let startGame: () => void;

  /**
   * todo;
   */
  let list: Record<string, (object: XR_game_object) => void>;

  /**
   * todo;
   */
  let registerGameClasses: (objectFactory: XR_object_factory) => void;

  /**
   * todo;
   */
  let getGameClassId: (gameTypeOption: string, isServer: boolean) => void;

  /**
   * todo;
   */
  let getUiClassId: (gameType: string) => void;

  /**
   * Utility to declare global variables.
   * Declared values can be found in _G / global LUA scope.
   */
  const declare_global: (key: string, value: unknown) => void;

  /**
   * Utility to get global variables.
   * TSTL assumes that returned value is object with methods, cast it to function/module
   * with callbacks for correct usage.
   * todo: Remove after TS migration.
   */
  const get_global: <T = any>(key: string) => T;

  /**
   * Utility to get current filename, similar to __filename in nodejs.
   */
  const $filename: string;
}
