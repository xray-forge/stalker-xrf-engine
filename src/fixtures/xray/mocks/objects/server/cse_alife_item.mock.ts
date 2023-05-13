import { jest } from "@jest/globals";
import { TXR_class_id, XR_cse_alife_item } from "xray16";

import { AbstractLuabindClass } from "@/fixtures/xray/mocks/objects/AbstractLuabindClass";

/**
 * todo;
 */
export class MockAlifeItem extends AbstractLuabindClass {}

/**
 * todo;
 */
export function mockServerAlifeItem({
  m_game_vertex_id = 1,
  clsid = jest.fn(() => -1 as TXR_class_id),
  ...data
}: Partial<XR_cse_alife_item> = {}): XR_cse_alife_item {
  return { m_game_vertex_id, clsid, ...data } as unknown as XR_cse_alife_item;
}
