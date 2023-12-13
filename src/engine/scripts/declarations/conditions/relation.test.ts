import { beforeAll, describe, it } from "@jest/globals";

import { checkXrCondition } from "@/fixtures/engine";

describe("relation conditions declaration", () => {
  beforeAll(() => {
    require("@/engine/scripts/declarations/conditions/relation");
  });

  it("should correctly inject external methods for game", () => {
    checkXrCondition("is_factions_enemies");
    checkXrCondition("is_factions_neutrals");
    checkXrCondition("is_factions_friends");
    checkXrCondition("is_faction_enemy_to_actor");
    checkXrCondition("is_faction_friend_to_actor");
    checkXrCondition("is_faction_neutral_to_actor");
    checkXrCondition("is_squad_friend_to_actor");
    checkXrCondition("is_squad_enemy_to_actor");
    checkXrCondition("fighting_actor");
    checkXrCondition("actor_enemy");
    checkXrCondition("actor_friend");
    checkXrCondition("actor_neutral");
    checkXrCondition("npc_community");
  });
});

describe("relation conditions implementation", () => {
  beforeAll(() => {
    require("@/engine/scripts/declarations/conditions/relation");
  });

  it.todo("is_factions_enemies should check actor and faction state");

  it.todo("is_factions_neutrals should check actor and faction state");

  it.todo("is_factions_friends should check actor and faction state");

  it.todo("is_faction_enemy_to_actor should check actor and faction state");

  it.todo("is_faction_friend_to_actor should check actor and faction state");

  it.todo("is_faction_neutral_to_actor should check actor and faction state");

  it.todo("is_squad_friend_to_actor should check relations");

  it.todo("is_squad_enemy_to_actor should check relations");

  it.todo("fighting_actor should check combat state of object");

  it.todo("actor_enemy should check if actor is enemy");

  it.todo("actor_friend should check if actor is friendly");

  it.todo("actor_neutral should check if actor is neutral");

  it.todo("npc_community should check object community");
});
