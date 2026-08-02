import { beforeAll, describe, expect, it } from "@jest/globals";
import { EActorMenuMode } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { actorConfig } from "@/engine/core/managers/actor/ActorConfig";
import { callXrCondition } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/conditions/actor/dead_body_searching");
});

describe("dead_body_searching", () => {
  it("should check if actor is searching dead body", () => {
    actorConfig.ACTOR_MENU_MODE = EActorMenuMode.TALK_DIALOG;
    expect(callXrCondition("dead_body_searching", MockGameObject.mockActor(), MockGameObject.mock())).toBe(false);

    actorConfig.ACTOR_MENU_MODE = EActorMenuMode.DEAD_BODY_SEARCH;
    expect(callXrCondition("dead_body_searching", MockGameObject.mockActor(), MockGameObject.mock())).toBe(true);

    actorConfig.ACTOR_MENU_MODE = EActorMenuMode.UNDEFINED;
    expect(callXrCondition("dead_body_searching", MockGameObject.mockActor(), MockGameObject.mock())).toBe(false);
  });
});
