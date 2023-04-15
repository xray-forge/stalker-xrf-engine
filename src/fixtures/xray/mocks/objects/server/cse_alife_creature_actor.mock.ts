import { jest } from "@jest/globals";
import { TXR_class_id, XR_cse_alife_creature_actor } from "xray16";

import { mockServerAlifeObject } from "@/fixtures/xray/mocks/objects";
import { AbstractLuabindClass } from "@/fixtures/xray/mocks/objects/AbstractLuabindClass";

/**
 * todo;
 */
export class MockAlifeCreatureActor extends AbstractLuabindClass {}

/**
 * todo;
 */
export function mockServerAlifeCreatureActor({
  m_game_vertex_id = 1,
  clsid = jest.fn(() => -1 as TXR_class_id),
  ...rest
}: Partial<XR_cse_alife_creature_actor> = {}): XR_cse_alife_creature_actor {
  return {
    ...mockServerAlifeObject(rest),
    m_game_vertex_id,
    clsid,
  } as unknown as XR_cse_alife_creature_actor;
}
