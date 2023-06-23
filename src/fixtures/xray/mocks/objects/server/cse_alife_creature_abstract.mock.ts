import { jest } from "@jest/globals";

import { ServerCreatureObject, ServerMonsterBaseObject } from "@/engine/lib/types";
import {
  MockAlifeDynamicObjectVisual,
  mockServerAlifeDynamicObjectVisual,
} from "@/fixtures/xray/mocks/objects/server/cse_alife_dynamic_object_visual.mock";

/**
 * todo;
 */
export class MockServerAlifeCreatureAbstract extends MockAlifeDynamicObjectVisual {
  public force_set_goodwill = jest.fn();
}

/**
 * todo;
 */
export function mockServerAlifeCreatureAbstract(
  base: Partial<ServerCreatureObject> = {
    force_set_goodwill: jest.fn(),
  }
): ServerCreatureObject {
  return mockServerAlifeDynamicObjectVisual(base) as unknown as ServerMonsterBaseObject;
}
