import { ServerGroupObject } from "@/engine/lib/types";
import { mockServerAlifeObject } from "@/fixtures/xray";
import { AbstractLuabindClass } from "@/fixtures/xray/mocks/objects/AbstractLuabindClass";

/**
 * todo;
 */
export class MockAlifeOnlineOfflineGroup extends AbstractLuabindClass {}

/**
 * todo;
 */
export function mockServerAlifeOnlineOfflineGroup(base: Partial<ServerGroupObject> = {}): ServerGroupObject {
  return { ...mockServerAlifeObject(), ...base } as unknown as ServerGroupObject;
}
