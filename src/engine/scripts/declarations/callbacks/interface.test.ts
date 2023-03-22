import { describe, expect, it } from "@jest/globals";

import { AnyObject } from "@/engine/lib/types";

describe("'interface' external callbacks", () => {
  const checkBinding = (name: string, container: AnyObject = global) => {
    expect(container[name]).toBeDefined();
  };

  it("should correctly inject external methods for game", () => {
    require("@/engine/scripts/declarations/callbacks/interface");

    checkBinding("ui_wpn_params");
    checkBinding("pda");
    checkBinding("actor_menu_inventory");
    checkBinding("actor_menu");
    checkBinding("inventory_upgrades");
    checkBinding("loadscreen");
  });
});
