import { jest } from "@jest/globals";
import { cse_alife_monster_base, cse_alife_object, TXR_class_id } from "xray16";

import { AbstractLuabindClass } from "@/fixtures/xray/mocks/objects/AbstractLuabindClass";

/**
 * todo;
 */
export class MockAlifeMonsterBase extends AbstractLuabindClass {}

/**
 * todo;
 */
export function mockServerAlifeMonsterBase({
  m_game_vertex_id = 1,
  clsid = jest.fn(() => -1 as TXR_class_id),
}: Partial<cse_alife_object> = {}): cse_alife_monster_base {
  return { m_game_vertex_id, clsid } as unknown as cse_alife_monster_base;
}
