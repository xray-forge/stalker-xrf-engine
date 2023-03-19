import { describe, expect, it } from "@jest/globals";

describe("'start' entry point", () => {
  const checkBinding = (name: string) => {
    // @ts-ignore
    expect(typeof global["start"]).not.toBeNull();
    // @ts-ignore
    expect(typeof global["start"]).toBe("object");
    // @ts-ignore
    expect(typeof global["start"][name]).toBe("function");
  };

  it("should correctly inject starting methods for game", () => {
    require("@/engine/scripts/start");

    checkBinding("callback");
  });
});
