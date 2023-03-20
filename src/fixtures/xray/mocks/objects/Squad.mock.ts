import { jest } from "@jest/globals";
import { TXR_class_id } from "xray16";

import { Squad } from "@/engine/core/objects";
import { mockLuaTable } from "@/fixtures/lua/mocks/LuaTable.mock";

/**
 * todo
 */
export class MockSquad {}

/**
 * todo;
 */
export function mockSquad({
  behaviour = mockLuaTable([
    ["a", "4"],
    ["c", "3"],
  ]),
  props = { a: 1, c: 2 },
  clsid = jest.fn(() => -1 as TXR_class_id),
  target_precondition = () => true,
}: Partial<Squad> = {}): Squad {
  return { props, clsid, target_precondition, behaviour } as unknown as Squad;
}
