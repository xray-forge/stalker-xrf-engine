import { describe, expect, it } from "@jest/globals";

import { parseConditionsList } from "@/engine/core/utils/ini/ini_parse";

describe("generic condlists parsing", () => {
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
});
