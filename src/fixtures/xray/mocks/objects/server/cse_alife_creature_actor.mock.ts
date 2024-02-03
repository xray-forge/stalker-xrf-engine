import { jest } from "@jest/globals";

import { communities } from "@/engine/lib/constants/communities";
import { ACTOR_ID } from "@/engine/lib/constants/ids";
import { ServerActorObject } from "@/engine/lib/types";
import { mockClsid } from "@/fixtures/xray/mocks/constants/clsid.mock";
import { MockAlifeDynamicObjectVisual } from "@/fixtures/xray/mocks/objects/server/cse_alife_dynamic_object_visual.mock";
import { IMockAlifeObjectConfig } from "@/fixtures/xray/mocks/objects/server/cse_alife_object.mock";

/**
 * Class based server object mock.
 */
export class MockAlifeCreatureActor extends MockAlifeDynamicObjectVisual {
  public static override mock(config: IMockAlifeObjectConfig = {}): ServerActorObject {
    return new this(config) as unknown as ServerActorObject;
  }

  public constructor(config: IMockAlifeObjectConfig = {}) {
    super({
      ...config,
      id: ACTOR_ID,
      clsid: mockClsid.script_actor,
      community: communities.actor,
    });
  }

  public on_death(): void {}

  public asMock(): ServerActorObject {
    return this as unknown as ServerActorObject;
  }

  public force_set_goodwill = jest.fn();
}
