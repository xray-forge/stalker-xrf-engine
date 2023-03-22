import { describe, expect, it } from "@jest/globals";

import { AnyObject } from "@/engine/lib/types";

describe("'register' entry point", () => {
  const checkBinding = (name: string, container: AnyObject = global) => {
    expect(container["register"]).toBeDefined();
    expect(typeof container["register"]).toBe("object");
    expect(typeof container["register"][name]).toBe("function");
  };

  it("should correctly inject registering methods for game", () => {
    require("@/engine/scripts/register");

    checkBinding("registerGameClasses");
    checkBinding("getGameClassId");
    checkBinding("getUiClassId");
  });
});
