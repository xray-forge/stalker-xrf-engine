import { jest } from "@jest/globals";
import { rotation } from "xray16";

import { ServerHumanObject } from "@/engine/lib/types";
import { MockAlifeDynamicObject } from "@/fixtures/xray/mocks/objects/server/cse_alife_dynamic_object.mock";
import { mockServerAlifeDynamicObjectVisual } from "@/fixtures/xray/mocks/objects/server/cse_alife_dynamic_object_visual.mock";

/**
 * todo;
 */
export class MockAlifeHumanStalker extends MockAlifeDynamicObject {
  public force_set_goodwill = jest.fn();
}

/**
 * todo;
 */
export function mockServerAlifeHumanStalker(base: Partial<ServerHumanObject> = {}): ServerHumanObject {
  return mockServerAlifeDynamicObjectVisual({
    ...base,
    community: base.community || jest.fn(() => "stalker"),
    force_set_goodwill: base.force_set_goodwill || jest.fn(),
    o_torso: base.o_torso || jest.fn(() => ({}) as unknown as rotation),
  } as unknown as ServerHumanObject) as unknown as ServerHumanObject;
}
