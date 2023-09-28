import { beforeEach, describe, expect, it } from "@jest/globals";

import { registerActor, registerSimulator, registry } from "@/engine/core/database";
import { getNpcSpeaker } from "@/engine/core/utils/dialog";
import { ClientObject } from "@/engine/lib/types";
import { mockActorClientGameObject, mockClientGameObject } from "@/fixtures/xray";

describe("reward utils", () => {
  beforeEach(() => {
    registerActor(mockActorClientGameObject());
    registerSimulator();
  });

  it("getNpcSpeaker should correctly pick speaker", () => {
    const first: ClientObject = mockClientGameObject();
    const second: ClientObject = mockClientGameObject();

    expect(getNpcSpeaker(registry.actor, first)).toBe(first);
    expect(getNpcSpeaker(registry.actor, second)).toBe(second);

    expect(getNpcSpeaker(first, registry.actor)).toBe(first);
    expect(getNpcSpeaker(second, registry.actor)).toBe(second);
  });
});
