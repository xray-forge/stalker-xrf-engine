import { beforeAll, describe, expect, it } from "@jest/globals";
import { AnyObject } from "xray16/lib";

beforeAll(() => {
  require("@/engine/declarations/callbacks/actor_menu");
});

describe("actor_menu", () => {
  it("registers mode callback", () => {
    expect((_G as AnyObject).actor_menu.actor_menu_mode).toBeDefined();
  });
});
