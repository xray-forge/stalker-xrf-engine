import { describe, expect, it } from "@jest/globals";

import { AnyObject } from "@/engine/lib/types";

describe("'start' entry point", () => {
  const checkBinding = (name: string, container: AnyObject = global) => {
    expect(typeof container["start"]).not.toBeNull();
    expect(typeof container["start"]).toBe("object");
    expect(typeof container["start"][name]).toBe("function");
  };

  it("should correctly inject starting methods for game", () => {
    require("@/engine/scripts/start");

    checkBinding("callback");
  });
});
