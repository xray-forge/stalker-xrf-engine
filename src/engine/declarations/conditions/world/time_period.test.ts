import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { level } from "xray16";
import { MockGameObject } from "xray16/mocks";

import { callXrCondition, mockRegisteredActor } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/conditions/world/time_period");
});

describe("time_period", () => {
  it("should check time", () => {
    jest.spyOn(level, "get_time_minutes").mockImplementation(() => 12);
    expect(callXrCondition("time_period", MockGameObject.mockActor(), MockGameObject.mock())).toBe(false);

    jest.spyOn(level, "get_time_minutes").mockImplementation(() => 12);
    expect(callXrCondition("time_period", MockGameObject.mockActor(), MockGameObject.mock(), 10, 5)).toBe(false);

    jest.spyOn(level, "get_time_minutes").mockImplementation(() => 12);
    expect(callXrCondition("time_period", MockGameObject.mockActor(), MockGameObject.mock(), 5, 10)).toBe(false);

    const { actorGameObject } = mockRegisteredActor();

    jest.spyOn(level, "get_time_minutes").mockImplementation(() => 1);
    expect(callXrCondition("time_period", actorGameObject, MockGameObject.mock(), 5, 4)).toBe(true);
    expect(callXrCondition("time_period", actorGameObject, MockGameObject.mock(), 4, 2)).toBe(true);
    expect(callXrCondition("time_period", actorGameObject, MockGameObject.mock(), 4, 1)).toBe(true);

    jest.spyOn(level, "get_time_minutes").mockImplementation(() => 4);
    expect(callXrCondition("time_period", actorGameObject, MockGameObject.mock(), 5, 4)).toBe(true);
    expect(callXrCondition("time_period", actorGameObject, MockGameObject.mock(), 5, 2)).toBe(false);
    expect(callXrCondition("time_period", actorGameObject, MockGameObject.mock(), 5, 1)).toBe(false);

    jest.spyOn(level, "get_time_minutes").mockImplementation(() => 7);
    expect(callXrCondition("time_period", actorGameObject, MockGameObject.mock(), 4, 3)).toBe(true);
    expect(callXrCondition("time_period", actorGameObject, MockGameObject.mock(), 4, 2)).toBe(false);
    expect(callXrCondition("time_period", actorGameObject, MockGameObject.mock(), 4, 1)).toBe(false);
  });
});
