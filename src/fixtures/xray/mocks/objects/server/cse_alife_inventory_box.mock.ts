import { ServerInventoryBox } from "@/engine/lib/types";
import {
  MockAlifeDynamicObjectVisual,
  mockServerAlifeDynamicObjectVisual,
} from "@/fixtures/xray/mocks/objects/server/cse_alife_dynamic_object_visual.mock";

/**
 * todo;
 */
export class MockAlifeInventoryBox extends MockAlifeDynamicObjectVisual {}

/**
 * todo;
 */
export function mockServerAlifeInventoryBox(base: Partial<ServerInventoryBox> = {}): ServerInventoryBox {
  return { ...mockServerAlifeDynamicObjectVisual(), ...base } as unknown as ServerInventoryBox;
}
