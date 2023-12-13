import { beforeAll, describe, it } from "@jest/globals";

import { checkXrCondition } from "@/fixtures/engine";

describe("actor conditions declaration", () => {
  beforeAll(() => {
    require("@/engine/scripts/declarations/conditions/actor");
  });

  it("should correctly inject external methods for game", () => {
    checkXrCondition("wealthy_functor");
    checkXrCondition("information_dealer_functor");
    checkXrCondition("actor_in_surge_cover");
    checkXrCondition("is_enemy_actor");
    checkXrCondition("actor_alive");
    checkXrCondition("actor_see_npc");
    checkXrCondition("npc_in_actor_frustum");
    checkXrCondition("dist_to_actor_le");
    checkXrCondition("dist_to_actor_ge");
    checkXrCondition("actor_health_le");
    checkXrCondition("actor_in_zone");
    checkXrCondition("heli_see_actor");
    checkXrCondition("actor_has_item");
    checkXrCondition("actor_has_item_count");
    checkXrCondition("hit_by_actor");
    checkXrCondition("killed_by_actor");
    checkXrCondition("actor_has_weapon");
    checkXrCondition("actor_active_detector");
    checkXrCondition("actor_on_level");
    checkXrCondition("talking");
    checkXrCondition("actor_nomove_nowpn");
    checkXrCondition("actor_has_nimble_weapon");
    checkXrCondition("actor_has_active_nimble_weapon");
    checkXrCondition("dead_body_searching");
  });
});

describe("actor conditions implementation", () => {
  beforeAll(() => {
    require("@/engine/scripts/declarations/conditions/actor");
  });

  it.todo("wealthy_functor should check wealth of the actor");

  it.todo("information_dealer_functor should check info dealer achievement");

  it.todo("actor_in_surge_cover should check if actor is in surge cover");

  it.todo("is_enemy_actor should check if actor and object are enemies");

  it.todo("actor_alive should check if actor is alive");

  it.todo("actor_see_npc should check if actor sees NPC");

  it.todo("actor_see_npc npc_in_actor_frustum check if npc is in actor frustum");

  it.todo("dist_to_actor_le should check distance between actor and object");

  it.todo("dist_to_actor_ge should check distance between actor and object");

  it.todo("actor_health_le should check actor health");

  it.todo("actor_in_zone should check actor in zone");

  it.todo("heli_see_actor should check if heli see actor");

  it.todo("actor_has_item should check if actor has item");

  it.todo("actor_has_item_count should check if actor has items");

  it.todo("hit_by_actor should check if object is hit by actor");

  it.todo("killed_by_actor should check if object is killed by actor");

  it.todo("actor_has_weapon should check if actor active item is weapon");

  it.todo("actor_active_detector should check currently active actor detector");

  it.todo("actor_on_level should check if actor is on level");

  it.todo("talking should check if actor is talking");

  it.todo("actor_nomove_nowpn should check if actor is talking without weapon");

  it.todo("actor_has_nimble_weapon should check if actor has nimble weapon");

  it.todo("actor_has_active_nimble_weapon should check if actor has active nimble weapon");

  it.todo("dead_body_searching should check if actor is searching dead body");
});
