import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { level } from "xray16";
import { MockGameObject } from "xray16/mocks";

import { callXrCondition, mockRegisteredActor } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/conditions/quests/is_jup_a12_mercs_time");
});

describe("is_jup_a12_mercs_time", () => {
  it("should check day state", () => {
    expect(callXrCondition("is_jup_a12_mercs_time", MockGameObject.mockActor(), MockGameObject.mock())).toBe(false);

    const { actorGameObject } = mockRegisteredActor();

    expect(callXrCondition("is_jup_a12_mercs_time", actorGameObject, MockGameObject.mock())).toBe(false);

    jest.spyOn(level, "get_time_hours").mockImplementation(() => 0);
    expect(callXrCondition("is_jup_a12_mercs_time", actorGameObject, MockGameObject.mock())).toBe(false);

    jest.spyOn(level, "get_time_hours").mockImplementation(() => 1);
    expect(callXrCondition("is_jup_a12_mercs_time", actorGameObject, MockGameObject.mock())).toBe(true);

    jest.spyOn(level, "get_time_hours").mockImplementation(() => 4);
    expect(callXrCondition("is_jup_a12_mercs_time", actorGameObject, MockGameObject.mock())).toBe(true);

    jest.spyOn(level, "get_time_hours").mockImplementation(() => 5);
    expect(callXrCondition("is_jup_a12_mercs_time", actorGameObject, MockGameObject.mock())).toBe(false);
  });
});
