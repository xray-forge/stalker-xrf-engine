import { describe, expect, it } from "@jest/globals";

import { priA15States } from "@/engine/core/animation/states/priA15";
import { assertArraysIntersecting } from "@/fixtures/engine";
import { mockFromLuaTable } from "@/fixtures/lua";

describe("priA15 states list", () => {
  it("should list all needed animations", () => {
    expect(priA15States.length()).toBe(115);

    assertArraysIntersecting(mockFromLuaTable(priA15States).getKeysArray(), [
      "pri_a15_idle_none",
      "pri_a15_idle_strap",
      "pri_a15_idle_unstrap",
      "pri_a15_vano_all",
      "pri_a15_vano_1_sokolov",
      "pri_a15_vano_1_zulus",
      "pri_a15_vano_1_wanderer",
      "pri_a15_vano_2_sokolov_zulus",
      "pri_a15_vano_2_sokolov_wanderer",
      "pri_a15_vano_2_zulus_wanderer",
      "pri_a15_vano_3_vano_alive",
      "pri_a15_sokolov_all",
      "pri_a15_sokolov_1_vano",
      "pri_a15_sokolov_1_zulus",
      "pri_a15_sokolov_1_wanderer",
      "pri_a15_sokolov_2_vano_zulus",
      "pri_a15_sokolov_2_vano_wanderer",
      "pri_a15_sokolov_2_zulus_wanderer",
      "pri_a15_sokolov_3_sokolov_alive",
      "pri_a15_zulus_all",
      "pri_a15_zulus_1_vano",
      "pri_a15_zulus_1_sokolov",
      "pri_a15_zulus_1_wanderer",
      "pri_a15_zulus_2_vano_sokolov",
      "pri_a15_zulus_2_vano_wanderer",
      "pri_a15_zulus_2_sokolov_wanderer",
      "pri_a15_zulus_3_zulus_alive",
      "pri_a15_wanderer_all",
      "pri_a15_wanderer_1_vano",
      "pri_a15_wanderer_1_sokolov",
      "pri_a15_wanderer_1_zulus",
      "pri_a15_wanderer_2_vano_sokolov",
      "pri_a15_wanderer_2_vano_zulus",
      "pri_a15_wanderer_2_sokolov_zulus",
      "pri_a15_wanderer_3_wanderer_alive",
      "pri_a15_actor_all",
      "pri_a15_actor_1_vano",
      "pri_a15_actor_1_sokolov",
      "pri_a15_actor_1_zulus",
      "pri_a15_actor_1_wanderer",
      "pri_a15_actor_2_vano_sokolov",
      "pri_a15_actor_2_vano_zulus",
      "pri_a15_actor_2_vano_wanderer",
      "pri_a15_actor_2_sokolov_zulus",
      "pri_a15_actor_2_sokolov_wanderer",
      "pri_a15_actor_2_zulus_wanderer",
      "pri_a15_actor_3_vano_alive",
      "pri_a15_actor_3_sokolov_alive",
      "pri_a15_actor_3_zulus_alive",
      "pri_a15_actor_3_wanderer_alive",
      "pri_a15_actor_all_dead",
      "pri_a15_military_tarasov_all",
      "pri_a15_military_tarasov_1_vano",
      "pri_a15_military_tarasov_1_sokolov",
      "pri_a15_military_tarasov_1_zulus",
      "pri_a15_military_tarasov_1_wanderer",
      "pri_a15_military_tarasov_2_vano_sokolov",
      "pri_a15_military_tarasov_2_vano_zulus",
      "pri_a15_military_tarasov_2_vano_wanderer",
      "pri_a15_military_tarasov_2_sokolov_zulus",
      "pri_a15_military_tarasov_2_sokolov_wanderer",
      "pri_a15_military_tarasov_2_zulus_wanderer",
      "pri_a15_military_tarasov_3_vano_alive",
      "pri_a15_military_tarasov_3_sokolov_alive",
      "pri_a15_military_tarasov_3_zulus_alive",
      "pri_a15_military_tarasov_3_wanderer_alive",
      "pri_a15_military_tarasov_all_dead",
      "pri_a15_military_2_all",
      "pri_a15_military_2_1_vano",
      "pri_a15_military_2_1_sokolov",
      "pri_a15_military_2_1_zulus",
      "pri_a15_military_2_1_wanderer",
      "pri_a15_military_2_2_vano_sokolov",
      "pri_a15_military_2_2_vano_zulus",
      "pri_a15_military_2_2_vano_wanderer",
      "pri_a15_military_2_2_sokolov_zulus",
      "pri_a15_military_2_2_sokolov_wanderer",
      "pri_a15_military_2_2_zulus_wanderer",
      "pri_a15_military_2_3_vano_alive",
      "pri_a15_military_2_3_sokolov_alive",
      "pri_a15_military_2_3_zulus_alive",
      "pri_a15_military_2_3_wanderer_alive",
      "pri_a15_military_2_all_dead",
      "pri_a15_military_3_all",
      "pri_a15_military_3_1_vano",
      "pri_a15_military_3_1_sokolov",
      "pri_a15_military_3_1_zulus",
      "pri_a15_military_3_1_wanderer",
      "pri_a15_military_3_2_vano_sokolov",
      "pri_a15_military_3_2_vano_zulus",
      "pri_a15_military_3_2_vano_wanderer",
      "pri_a15_military_3_2_sokolov_zulus",
      "pri_a15_military_3_2_sokolov_wanderer",
      "pri_a15_military_3_2_zulus_wanderer",
      "pri_a15_military_3_3_vano_alive",
      "pri_a15_military_3_3_sokolov_alive",
      "pri_a15_military_3_3_zulus_alive",
      "pri_a15_military_3_3_wanderer_alive",
      "pri_a15_military_3_all_dead",
      "pri_a15_military_4_all",
      "pri_a15_military_4_1_vano",
      "pri_a15_military_4_1_sokolov",
      "pri_a15_military_4_1_zulus",
      "pri_a15_military_4_1_wanderer",
      "pri_a15_military_4_2_vano_sokolov",
      "pri_a15_military_4_2_vano_zulus",
      "pri_a15_military_4_2_vano_wanderer",
      "pri_a15_military_4_2_sokolov_zulus",
      "pri_a15_military_4_2_sokolov_wanderer",
      "pri_a15_military_4_2_zulus_wanderer",
      "pri_a15_military_4_3_vano_alive",
      "pri_a15_military_4_3_sokolov_alive",
      "pri_a15_military_4_3_zulus_alive",
      "pri_a15_military_4_3_wanderer_alive",
      "pri_a15_military_4_all_dead",
    ]);
  });
});
