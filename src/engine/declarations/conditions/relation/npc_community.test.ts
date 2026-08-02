import { beforeAll, describe, expect, it } from "@jest/globals";
import { clsid } from "xray16";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { callXrCondition } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/conditions/relation/npc_community");
});

describe("npc_community", () => {
  it("should check object community", () => {
    const stalker: GameObject = MockGameObject.mockStalker({ community: "zombied" });

    expect(() => callXrCondition("npc_community", MockGameObject.mockActor(), stalker)).toThrow(
      "Condition 'npc_community' requires community name as parameter."
    );

    expect(callXrCondition("npc_community", MockGameObject.mockActor(), stalker, "zombied")).toBe(true);
    expect(callXrCondition("npc_community", MockGameObject.mockActor(), stalker, "stalker")).toBe(false);

    const monster: GameObject = MockGameObject.mock({ clsid: clsid.boar_s });

    expect(callXrCondition("npc_community", MockGameObject.mockActor(), monster, "monster")).toBe(true);
    expect(callXrCondition("npc_community", MockGameObject.mockActor(), monster, "stalker")).toBe(false);
  });
});
