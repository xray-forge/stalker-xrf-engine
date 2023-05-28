import { ServerHumanObject } from "@/engine/lib/types";
import { AbstractLuabindClass } from "@/fixtures/xray/mocks/objects/AbstractLuabindClass";
import { mockServerAlifeDynamicObjectVisual } from "@/fixtures/xray/mocks/objects/server/cse_alife_dynamic_object_visual.mock";

/**
 * todo;
 */
export class MockAlifeHumanStalker extends AbstractLuabindClass {}

/**
 * todo;
 */
export function mockServerAlifeHumanStalker(base: Partial<ServerHumanObject> = {}): ServerHumanObject {
  return { ...mockServerAlifeDynamicObjectVisual(), ...base } as unknown as ServerHumanObject;
}
