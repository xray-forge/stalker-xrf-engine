import { describe, expect, it } from "@jest/globals";

describe("'register' entry point", () => {
  const checkBinding = (name: string) => {
    // @ts-ignore
    expect(typeof global["register"]).not.toBeNull();
    // @ts-ignore
    expect(typeof global["register"]).toBe("object");
    // @ts-ignore
    expect(typeof global["register"][name]).toBe("function");
  };

  it("should correctly inject registering methods for game", () => {
    require("@/engine/scripts/register");

    checkBinding("registerGameClasses");
    checkBinding("getGameClassId");
    checkBinding("getUiClassId");
  });
});
