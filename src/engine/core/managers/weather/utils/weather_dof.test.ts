import { beforeEach, describe, expect, it } from "@jest/globals";
import { get_console } from "xray16";

import { getManager } from "@/engine/core/database";
import { WeatherManager } from "@/engine/core/managers/weather";
import { resetDof, updateDof } from "@/engine/core/managers/weather/utils/weather_dof";
import { Console } from "@/engine/lib/types";
import { resetRegistry } from "@/fixtures/engine";
import { resetFunctionMock } from "@/fixtures/jest";

describe("resetDof util", () => {
  beforeEach(() => {
    resetFunctionMock(get_console().execute);
  });

  it("should correctly apply dof commands", () => {
    const console: Console = get_console();

    resetDof();

    expect(console.execute).toHaveBeenCalledTimes(2);
    expect(console.execute).toHaveBeenCalledWith("r2_dof_far 800");
    expect(console.execute).toHaveBeenCalledWith("r2_dof_kernel 2");
  });
});

describe("updateDof util", () => {
  beforeEach(() => {
    resetRegistry();
    resetFunctionMock(get_console().execute);
  });

  it("should correctly fail if weather is not set / initialized", () => {
    expect(() => updateDof(getManager(WeatherManager))).toThrow(
      "Could not find fog distance descriptor for weather switch pair 'nil -> nil'"
    );
  });
});
