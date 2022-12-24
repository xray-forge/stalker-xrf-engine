import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("utils/debug");

/**
 *
 * -- �������� ���� (����� ������ ��������� �� ������ � ���)
 * function abort(fmt, ...)
 *  local reason = string.format(fmt, ...)
 *  --error_log(reason)
 * end
 */

export function abort(format: string, ...rest: Array<any>): void {
  log.info("[abort] Aborting game:", lua_string.format(format, ...rest));

  const reason = lua_string.format(format, ...rest);
}

/**
 * -- ������� � ��� ���� ������ �������.
 * function callstack()
 *  if debug ~= nil then
 *    log(debug.traceback(2))
 *  end
 * end
 */
export function callstack(): void {
  if (get_global("debug") !== null) {
    log.info("[callstack]", get_global("debug").traceback(2));
  }
}
