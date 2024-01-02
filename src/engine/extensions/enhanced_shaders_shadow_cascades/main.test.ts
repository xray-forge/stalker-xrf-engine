import { beforeEach, describe, expect, it } from "@jest/globals";
import { get_console } from "xray16";

import { register } from "@/engine/extensions/enhanced_shaders_shadow_cascades/main";
import { Console } from "@/engine/lib/types";
import { resetFunctionMock } from "@/fixtures/jest";

describe("shadow cascades extension", () => {
  const console: Console = get_console();

  beforeEach(() => {
    resetFunctionMock(console.execute);
  });

  it("should correctly call console commands", () => {
    register();

    expect(console.execute).toHaveBeenCalledTimes(2);
    expect(console.execute).toHaveBeenCalledWith("ssfx_shadow_cascades (20,60,160)");
    expect(console.execute).toHaveBeenCalledWith("ssfx_grass_shadows (0,0.35,30,0)");
  });
});
