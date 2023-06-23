import { jest } from "@jest/globals";

import { ServerHumanObject } from "@/engine/lib/types";
import { AbstractLuabindClass } from "@/fixtures/xray/mocks/objects/AbstractLuabindClass";
import { mockServerAlifeDynamicObjectVisual } from "@/fixtures/xray/mocks/objects/server/cse_alife_dynamic_object_visual.mock";

/**
 * todo;
 */
export class MockAlifeHumanStalker extends AbstractLuabindClass {
  public force_set_goodwill = jest.fn();
}

/**
 * todo;
 */
export function mockServerAlifeHumanStalker(
  base: Partial<ServerHumanObject> = {
    force_set_goodwill: jest.fn(),
  }
): ServerHumanObject {
  return mockServerAlifeDynamicObjectVisual(base) as unknown as ServerHumanObject;
}
