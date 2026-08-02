import { beforeAll, describe, expect, it } from "@jest/globals";
import { AnyObject } from "xray16/lib";

beforeAll(() => {
  require("@/engine/declarations/callbacks/game/level_input");
});

describe("level_input", () => {
  it("registers input callbacks", () => {
    expect((_G as AnyObject).level_input.on_key_press).toBeDefined();
  });
});
