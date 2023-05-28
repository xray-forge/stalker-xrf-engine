import { jest } from "@jest/globals";

import { Squad } from "@/engine/core/objects";
import { TClassId } from "@/engine/lib/types";
import { mockLuaTable } from "@/fixtures/lua/mocks/LuaTable.mock";
import { AbstractLuabindClass } from "@/fixtures/xray/mocks/objects/AbstractLuabindClass";

/**
 * todo
 */
export class MockSquad extends AbstractLuabindClass {}

/**
 * todo;
 */
export function mockSquad({
  behaviour = mockLuaTable([
    ["a", "4"],
    ["c", "3"],
  ]),
  simulationProperties = { a: 1, c: 2 },
  clsid = jest.fn(() => -1 as TClassId),
  isValidSquadTarget = () => true,
}: Partial<Squad> = {}): Squad {
  return {
    simulationProperties: simulationProperties,
    clsid,
    isValidSquadTarget: isValidSquadTarget,
    behaviour,
  } as unknown as Squad;
}
