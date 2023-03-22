import { describe, expect, it } from "@jest/globals";

import { AnyObject } from "@/engine/lib/types";

describe("'actor' external callbacks", () => {
  const checkBinding = (name: string, container: AnyObject = global) => {
    expect(container[name]).toBeDefined();
  };

  it("should correctly inject external methods for game", () => {
    require("@/engine/scripts/declarations/callbacks/actor");

    checkBinding("on_actor_critical_power");
    checkBinding("on_actor_critical_max_power");
    checkBinding("on_actor_bleeding");
    checkBinding("on_actor_satiety");
    checkBinding("on_actor_radiation");
    checkBinding("on_actor_weapon_jammed");
    checkBinding("on_actor_cant_walk_weight");
    checkBinding("on_actor_psy");
    checkBinding("travel_callbacks");
  });
});
