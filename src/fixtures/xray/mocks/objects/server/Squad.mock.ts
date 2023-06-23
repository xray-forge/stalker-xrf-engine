import { jest } from "@jest/globals";

import type { Squad } from "@/engine/core/objects";
import { ServerGroupObject, TClassId } from "@/engine/lib/types";
import { mockLuaTable } from "@/fixtures/lua/mocks/LuaTable.mock";
import {
  MockAlifeOnlineOfflineGroup,
  mockServerAlifeOnlineOfflineGroup,
} from "@/fixtures/xray/mocks/objects/server/cse_alife_online_offline_group.mock";

/**
 * todo
 */
export class MockSquad extends MockAlifeOnlineOfflineGroup {}

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
  return mockServerAlifeOnlineOfflineGroup({
    simulationProperties: simulationProperties,
    clsid,
    isValidSquadTarget: isValidSquadTarget,
    behaviour,
  } as Partial<ServerGroupObject>) as unknown as Squad;
}
