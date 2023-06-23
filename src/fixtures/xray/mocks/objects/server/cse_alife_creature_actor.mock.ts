import { jest } from "@jest/globals";

import { communities, TCommunity } from "@/engine/lib/constants/communities";
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

  public community(): TCommunity {
    return communities.actor;
  }

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
  return mockServerAlifeDynamicObjectVisual({
    ...base,
    id,
    force_set_goodwill: base.force_set_goodwill || jest.fn(),
    community: base.community || jest.fn(() => communities.actor),
  } as ServerActorObject) as ServerActorObject;
}
