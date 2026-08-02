import { beforeAll, describe, expect, it } from "@jest/globals";
import { level } from "xray16";
import { TRUE } from "xray16/lib";
import { MockGameObject } from "xray16/mocks";

import { callXrEffect } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/world/set_weather");
});

describe("set_weather", () => {
  it("should change game weather", () => {
    callXrEffect("set_weather", MockGameObject.mockActor(), MockGameObject.mock());
    expect(level.set_weather).not.toHaveBeenCalled();

    callXrEffect("set_weather", MockGameObject.mockActor(), MockGameObject.mock(), "test-weather-1");
    expect(level.set_weather).toHaveBeenCalledTimes(1);
    expect(level.set_weather).toHaveBeenCalledWith("test-weather-1", false);

    callXrEffect("set_weather", MockGameObject.mockActor(), MockGameObject.mock(), "test-weather-2", TRUE);
    expect(level.set_weather).toHaveBeenCalledTimes(2);
    expect(level.set_weather).toHaveBeenCalledWith("test-weather-2", true);
  });
});
