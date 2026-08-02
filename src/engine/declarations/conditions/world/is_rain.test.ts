import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { level } from "xray16";
import { MockGameObject } from "xray16/mocks";

import { callXrCondition, mockRegisteredActor } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/conditions/world/is_rain");
});

describe("is_rain", () => {
  it("should check whether it is raining and require registered actor", () => {
    jest.spyOn(level, "rain_factor").mockImplementation(() => 1);
    expect(callXrCondition("is_rain", MockGameObject.mockActor(), MockGameObject.mock())).toBe(false);

    const { actorGameObject } = mockRegisteredActor();

    jest.spyOn(level, "rain_factor").mockImplementation(() => -1);
    expect(callXrCondition("is_rain", actorGameObject, MockGameObject.mock())).toBe(false);

    jest.spyOn(level, "rain_factor").mockImplementation(() => 0);
    expect(callXrCondition("is_rain", actorGameObject, MockGameObject.mock())).toBe(false);

    jest.spyOn(level, "rain_factor").mockImplementation(() => 0.5);
    expect(callXrCondition("is_rain", actorGameObject, MockGameObject.mock())).toBe(true);

    jest.spyOn(level, "rain_factor").mockImplementation(() => 1);
    expect(callXrCondition("is_rain", actorGameObject, MockGameObject.mock())).toBe(true);
  });
});
