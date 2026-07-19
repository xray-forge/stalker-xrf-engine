import { describe, expect, it } from "@jest/globals";

import { parseConditionsList } from "@/engine/core/ini/ini_parse";

describe("correct generic condlists parsing", () => {
  it("jup_b8_psy_dog_1/2: only a prefixed function call is a condlist condition", () => {
    expect(parseConditionsList("{=actor_in_zone(jup_surge_hide_b8)} mob_home@1")).toStrictEqualLuaArrays([
      {
        infop_check: {
          "1": {
            expected: true,
            func: "actor_in_zone",
            params: { "1": "jup_surge_hide_b8" },
          },
        },
        infop_set: {},
        section: "mob_home@1",
      },
    ]);
  });

  it("pas_b400_hall: Vano moves to the final hall only after both info portions are present", () => {
    expect(
      parseConditionsList("{+pas_b400_vano_about_dome_1_played +pas_b400_sr_hall_12} walker@vano_hall_12")
    ).toStrictEqualLuaArrays([
      {
        infop_check: {
          "1": { name: "pas_b400_vano_about_dome_1_played", required: true },
          "2": { name: "pas_b400_sr_hall_12", required: true },
        },
        infop_set: {},
        section: "walker@vano_hall_12",
      },
    ]);
  });

  it("zat_b20_noah_teleport: runs cleanup effects after the plateau route becomes known", () => {
    expect(
      parseConditionsList("{+zat_b20_plateau_way_known} %+zat_b20_destroy_actor =destroy_object%")
    ).toStrictEqualLuaArrays([
      {
        infop_check: { "1": { name: "zat_b20_plateau_way_known", required: true } },
        infop_set: {
          "1": { name: "zat_b20_destroy_actor", required: true },
          "2": { expected: true, func: "destroy_object", params: null },
        },
        section: "",
      },
    ]);
  });

  it("zat_b7_duty_illicit_dealer_b5: keeps combat-ignore predicates in separate branches", () => {
    expect(
      parseConditionsList(
        "{=check_enemy_name(zat_b5_dealer_assistant_1:zat_b5_dealer_assistant_2)} true, " +
          "{=check_enemy_name(sim_default) =fighting_dist_ge(30)} true"
      )
    ).toStrictEqualLuaArrays([
      {
        infop_check: {
          "1": {
            expected: true,
            func: "check_enemy_name",
            params: { "1": "zat_b5_dealer_assistant_1", "2": "zat_b5_dealer_assistant_2" },
          },
        },
        infop_set: {},
        section: "true",
      },
      {
        infop_check: {
          "1": { expected: true, func: "check_enemy_name", params: { "1": "sim_default" } },
          "2": { expected: true, func: "fighting_dist_ge", params: { "1": 30 } },
        },
        infop_set: {},
        section: "true",
      },
    ]);
  });
});

describe("incorrect generic condlists parsing", () => {
  it("jup_b8_psy_dog_1/2: legacy silent issue", () => {
    expect(parseConditionsList("{actor_in_zone(jup_surge_hide_b8)} mob_home@1")).toStrictEqualLuaArrays([
      {
        infop_check: {},
        infop_set: {},
        section: "mob_home@1",
      },
    ]);
  });

  it("pas_b400_hall: legacy silent issue", () => {
    expect(
      parseConditionsList("{pas_b400_vano_about_dome_1_played +pas_b400_sr_hall_12} walker@vano_hall_12")
    ).toStrictEqualLuaArrays([
      {
        infop_check: {
          "1": { name: "pas_b400_sr_hall_12", required: true },
        },
        infop_set: {},
        section: "walker@vano_hall_12",
      },
    ]);
  });

  it("zat_b20_noah_teleport: legacy silent issue", () => {
    expect(
      parseConditionsList("{+zat_b20_plateau_way_known)} %+zat_b20_destroy_actor =destroy_object%")
    ).toStrictEqualLuaArrays([
      {
        // Invalid name.
        infop_check: { "1": { name: "zat_b20_plateau_way_known)", required: true } },
        infop_set: {
          "1": { name: "zat_b20_destroy_actor", required: true },
          "2": { expected: true, func: "destroy_object", params: null },
        },
        section: "",
      },
    ]);
  });

  it("zat_b7_duty_illicit_dealer_b5: legacy missing brace drops the assistant predicate", () => {
    expect(
      parseConditionsList(
        "{=check_enemy_name(zat_b5_dealer_assistant_1:zat_b5_dealer_assistant_2) true, " +
          "{=check_enemy_name(sim_default) =fighting_dist_ge(30)} true"
      )
    ).toStrictEqualLuaArrays([
      {
        infop_check: {},
        infop_set: {},
        section: "{=check_enemy_name(zat_b5_dealer_assistant_1:zat_b5_dealer_assistant_2) true",
      },
      {
        infop_check: {
          "1": { expected: true, func: "check_enemy_name", params: { "1": "sim_default" } },
          "2": { expected: true, func: "fighting_dist_ge", params: { "1": 30 } },
        },
        infop_set: {},
        section: "true",
      },
    ]);
  });
});
