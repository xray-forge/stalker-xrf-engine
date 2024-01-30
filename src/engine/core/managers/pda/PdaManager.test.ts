import { describe, expect, it } from "@jest/globals";

import { getManager } from "@/engine/core/database";
import { PdaManager } from "@/engine/core/managers/pda/PdaManager";
import { StatisticsManager } from "@/engine/core/managers/statistics";
import { weapons } from "@/engine/lib/constants/items/weapons";

describe("PdaManager class", () => {
  it.todo("should correctly initialize and destroy");

  it.todo("should correctly get stat by section");

  it.todo("should correctly get best killed monster display info");

  it.todo("should correctly get best killed monster display background");

  it("should correctly get favorite weapon", () => {
    const manager: PdaManager = getManager(PdaManager);

    expect(manager.getFavoriteWeapon()).toBe(weapons.wpn_knife);

    getManager(StatisticsManager).actorStatistics.favoriteWeapon = weapons.wpn_desert_eagle;

    expect(manager.getFavoriteWeapon()).toBe(weapons.wpn_desert_eagle);
  });

  it("should correctly fill faction state", () => {
    const manager: PdaManager = getManager(PdaManager);

    expect(manager.fillFactionState({})).toEqual({
      actor_goodwill: 3000,
      bonus: 0,
      icon: "ui_inGame2_hint_wnd_bar",
      icon_big: "logos_big_empty",
      location: "a",
      member_count: 0,
      name: "ui_inGame2_hint_wnd_bar",
      power: 0,
      resource: 0,
      target: "translated_ui_st_no_faction",
      target_desc: "aaa",
      war_state1: "a",
      war_state2: "3",
      war_state3: "33",
      war_state4: "23",
      war_state5: "5",
      war_state_hint1: "1",
      war_state_hint2: "2",
      war_state_hint3: "",
      war_state_hint4: "",
      war_state_hint5: "5",
    });
  });
});
