import { ACTOR_ID } from "@/engine/lib/constants/ids";
import { ServerActorObject, TNumberId } from "@/engine/lib/types";
import {
  MockAlifeDynamicObjectVisual,
  mockServerAlifeDynamicObjectVisual,
} from "@/fixtures/xray/mocks/objects/server/cse_alife_dynamic_object_visual.mock";

/**
 * todo;
 */
export class MockAlifeCreatureActor extends MockAlifeDynamicObjectVisual {
  public override id: TNumberId = 0;

  public asMock(): ServerActorObject {
    return this as unknown as ServerActorObject;
  }
}

/**
 * Mock generic actor object.
 */
export function mockServerAlifeCreatureActor({
  id = ACTOR_ID,
  ...base
}: Partial<ServerActorObject> = {}): ServerActorObject {
  return mockServerAlifeDynamicObjectVisual({ id, ...base }) as ServerActorObject;
}
