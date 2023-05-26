import { jest } from "@jest/globals";
import { cse_alife_online_offline_group, TXR_class_id } from "xray16";

import { AbstractLuabindClass } from "@/fixtures/xray/mocks/objects/AbstractLuabindClass";

/**
 * todo;
 */
export class MockAlifeOnlineOfflineGroup extends AbstractLuabindClass {}

/**
 * todo;
 */
export function mockServerAlifeOnlineOfflineGroup({
  m_game_vertex_id = 1,
  clsid = jest.fn(() => -1 as TXR_class_id),
}: Partial<cse_alife_online_offline_group> = {}): cse_alife_online_offline_group {
  return { m_game_vertex_id, clsid } as unknown as cse_alife_online_offline_group;
}
