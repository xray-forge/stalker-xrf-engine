import { beforeAll, describe, it } from "@jest/globals";

import { checkBinding } from "@/fixtures/engine";

describe("actor external callbacks", () => {
  beforeAll(() => {
    require("@/engine/scripts/declarations/callbacks/actor");
  });

  it("should correctly inject external methods for game", () => {
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
