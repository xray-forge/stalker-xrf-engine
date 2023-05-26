import { jest } from "@jest/globals";
import type { CConsole } from "xray16";

import { mockLuabindBase } from "@/fixtures/xray/mocks/luabind.mock";

/**
 * todo;
 */
export function mockConsole({
  show = jest.fn(),
  hide = jest.fn(),
  execute = jest.fn(),
  execute_deferred = jest.fn(),
  execute_script = jest.fn(),
  get_bool = jest.fn(() => false),
  get_float = jest.fn(() => 0.5),
  get_integer = jest.fn(() => 1),
  get_string = jest.fn(() => "test"),
  get_token = jest.fn(() => "token"),
}: Partial<CConsole> = {}): CConsole {
  return {
    ...mockLuabindBase(),
    show,
    hide,
    execute,
    execute_deferred,
    execute_script,
    get_bool,
    get_float,
    get_integer,
    get_string,
    get_token,
  };
}

/**
 * todo;
 */
export const gameConsole: CConsole = mockConsole();

/**
 * todo;
 */
export function mockGetConsole(): CConsole {
  return gameConsole;
}
