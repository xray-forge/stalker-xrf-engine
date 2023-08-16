import { jest } from "@jest/globals";

import { MAX_U16 } from "@/engine/lib/constants/memory";
import { ServerCreatureObject, ServerMonsterBaseObject } from "@/engine/lib/types";
import {
  MockAlifeDynamicObjectVisual,
  mockServerAlifeDynamicObjectVisual,
} from "@/fixtures/xray/mocks/objects/server/cse_alife_dynamic_object_visual.mock";

/**
 * todo;
 */
export class MockServerAlifeCreatureAbstract extends MockAlifeDynamicObjectVisual {
  public m_smart_terrain_id = MAX_U16;
  public force_set_goodwill = jest.fn();
  public smart_terrain_task_activate = jest.fn();
}

/**
 * todo;
 */
export function mockServerAlifeCreatureAbstract(
  base: Partial<ServerCreatureObject> = {
    force_set_goodwill: jest.fn(),
  }
): ServerCreatureObject {
  return mockServerAlifeDynamicObjectVisual({
    ...base,
    m_smart_terrain_id: base.m_smart_terrain_id || MAX_U16,
    smart_terrain_task_activate: base.smart_terrain_task_activate || jest.fn(),
  } as unknown as ServerMonsterBaseObject) as unknown as ServerMonsterBaseObject;
}
