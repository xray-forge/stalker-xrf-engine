import { beforeAll, describe, expect, it } from "@jest/globals";
import { AnyObject } from "xray16/lib";

beforeAll(() => {
  require("@/engine/declarations/callbacks/interface/actor_menu_inventory");
});

describe("actor_menu_inventory", () => {
  it("registers inventory callbacks", () => {
    expect((_G as AnyObject).actor_menu_inventory.CUIActorMenu_OnItemDropped).toBeDefined();
  });
});
