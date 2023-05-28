import { ServerItemObject } from "@/engine/lib/types";
import {
  MockAlifeDynamicObjectVisual,
  mockServerAlifeDynamicObjectVisual,
} from "@/fixtures/xray/mocks/objects/server/cse_alife_dynamic_object_visual.mock";

/**
 * todo;
 */
export class MockAlifeItem extends MockAlifeDynamicObjectVisual {}

/**
 * todo;
 */
export function mockServerAlifeItem(base: Partial<ServerItemObject> = {}): ServerItemObject {
  return { ...mockServerAlifeDynamicObjectVisual(), ...base } as unknown as ServerItemObject;
}
