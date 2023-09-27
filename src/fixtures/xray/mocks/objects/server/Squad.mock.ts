import { jest } from "@jest/globals";

import type { Squad } from "@/engine/core/objects/server/squad";
import { ServerGroupObject, TClassId, TName } from "@/engine/lib/types";
import { MockLuaTable, mockLuaTable } from "@/fixtures/lua/mocks/LuaTable.mock";
import {
  MockAlifeOnlineOfflineGroup,
  mockServerAlifeOnlineOfflineGroup,
} from "@/fixtures/xray/mocks/objects/server/cse_alife_online_offline_group.mock";

/**
 * Class based mock of squad group.
 */
export class MockSquad extends MockAlifeOnlineOfflineGroup {}

/**
 * Mock squad record based on online-offline group for testing.
 */
export function mockSquad({
  behaviour = mockLuaTable([
    ["a", "4"],
    ["c", "3"],
  ]),
  simulationProperties = MockLuaTable.mockFromObject<TName, string>({ a: "1", c: "2" }),
  clsid = jest.fn(() => -1 as TClassId),
  isValidSquadTarget = () => true,
}: Partial<Squad> = {}): Squad {
  return mockServerAlifeOnlineOfflineGroup({
    simulationProperties: simulationProperties,
    clsid,
    isValidSquadTarget: isValidSquadTarget,
    behaviour,
  } as Partial<ServerGroupObject>) as unknown as Squad;
}
