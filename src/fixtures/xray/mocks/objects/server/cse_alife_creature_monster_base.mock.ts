import { ServerMonsterAbstractObject, ServerMonsterBaseObject } from "@/engine/lib/types";
import { mockServerAlifeObject } from "@/fixtures/xray";
import { AbstractLuabindClass } from "@/fixtures/xray/mocks/objects/AbstractLuabindClass";

/**
 * todo;
 */
export class MockAlifeMonsterBase extends AbstractLuabindClass {}

/**
 * todo;
 */
export function mockServerAlifeMonsterBase(base: Partial<ServerMonsterBaseObject> = {}): ServerMonsterAbstractObject {
  return mockServerAlifeObject(base) as unknown as ServerMonsterBaseObject;
}
