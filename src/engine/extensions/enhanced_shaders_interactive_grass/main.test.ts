import { beforeEach, describe, expect, it } from "@jest/globals";
import { get_console } from "xray16";

import { register } from "@/engine/extensions/enhanced_shaders_interactive_grass/main";
import { Console } from "@/engine/lib/types";
import { resetFunctionMock } from "@/fixtures/jest";

describe("shadow cascades extension", () => {
  const console: Console = get_console();

  beforeEach(() => {
    resetFunctionMock(console.execute);
  });

  it("should correctly call console commands", () => {
    register();

    expect(console.execute).toHaveBeenCalledTimes(3);
    expect(console.execute).toHaveBeenCalledWith("ssfx_grass_interactive (1,8,2000,1)");
    expect(console.execute).toHaveBeenCalledWith("ssfx_int_grass_params_1 (1,1,1,25)");
    expect(console.execute).toHaveBeenCalledWith("ssfx_int_grass_params_2 (1,5,0.3,2)");
  });
});
