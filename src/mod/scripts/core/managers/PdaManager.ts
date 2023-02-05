import { game } from "xray16";

import { TWeapon, weapons } from "@/mod/globals/items/weapons";
import { monsters, TMonster } from "@/mod/globals/monsters";
import { texturesIngame, TTexture } from "@/mod/globals/textures";
import { Optional, PartialRecord } from "@/mod/lib/types";
import { AbstractCoreManager } from "@/mod/scripts/core/managers/AbstractCoreManager";
import { StatisticsManager } from "@/mod/scripts/core/managers/StatisticsManager";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("PdaManager");

const killedMonsters: PartialRecord<TMonster, { back: TTexture; icon: string }> = {
  [monsters.bloodsucker_weak]: { back: texturesIngame.ui_inGame2_Krovosos, icon: "" },
  [monsters.bloodsucker_normal]: { back: texturesIngame.ui_inGame2_Krovosos_1, icon: "" },
  [monsters.bloodsucker_strong]: { back: texturesIngame.ui_inGame2_Krovosos_2, icon: "" },
  [monsters.boar_weak]: { back: texturesIngame.ui_inGame2_Kaban_1, icon: "" },
  [monsters.boar_strong]: { back: texturesIngame.ui_inGame2_Kaban, icon: "" },
  [monsters.burer]: { back: texturesIngame.ui_inGame2_Burer, icon: "" },
  [monsters.chimera]: { back: texturesIngame.ui_inGame2_Himera, icon: "" },
  [monsters.controller]: { back: texturesIngame.ui_inGame2_Controller, icon: "" },
  [monsters.dog]: { back: texturesIngame.ui_inGame2_Blind_Dog, icon: "" },
  [monsters.flesh_weak]: { back: texturesIngame.ui_inGame2_Flesh, icon: "" },
  [monsters.flesh_strong]: { back: texturesIngame.ui_inGame2_Flesh_1, icon: "" },
  [monsters.gigant]: { back: texturesIngame.ui_inGame2_Pseudo_Gigant, icon: "" },
  [monsters.poltergeist_tele]: { back: texturesIngame.ui_inGame2_Poltergeyst, icon: "" },
  [monsters.poltergeist_flame]: { back: texturesIngame.ui_inGame2_Poltergeist_1, icon: "" },
  [monsters.psy_dog_weak]: { back: texturesIngame.ui_inGame2_PseudoDog_1, icon: "" },
  [monsters.psy_dog_strong]: { back: texturesIngame.ui_inGame2_PseudoDog, icon: "" },
  [monsters.pseudodog_weak]: { back: texturesIngame.ui_inGame2_PseudoDog_1, icon: "" },
  [monsters.pseudodog_strong]: { back: texturesIngame.ui_inGame2_PseudoDog, icon: "" },
  [monsters.snork]: { back: texturesIngame.ui_inGame2_Snork, icon: "" },
  [monsters.tushkano]: { back: texturesIngame.ui_inGame2_Tushkan, icon: "" },
};

enum EStatSection {
  UNKNOWN,
  SURGES,
  COMPLETED_QUESTS,
  KILLED_MONSTERS,
  KILLED_STALKERS,
  ARTEFACTS_FOUND,
  SECRETS_FOUND,
}

/**
 * todo;
 */
export class PdaManager extends AbstractCoreManager {
  public getStat(section: EStatSection): string {
    const statisticsManager: StatisticsManager = StatisticsManager.getInstance();

    switch (section) {
      case EStatSection.UNKNOWN:
        return "00:00:00";
      case EStatSection.SURGES:
        return tostring(statisticsManager.actor_statistic.surges);
      case EStatSection.COMPLETED_QUESTS:
        return tostring(statisticsManager.actor_statistic.completed_quests);
      case EStatSection.KILLED_MONSTERS:
        return tostring(statisticsManager.actor_statistic.killed_monsters);
      case EStatSection.KILLED_STALKERS:
        return tostring(statisticsManager.actor_statistic.killed_stalkers);
      case EStatSection.ARTEFACTS_FOUND:
        return tostring(statisticsManager.actor_statistic.artefacts_founded);
      case EStatSection.SECRETS_FOUND:
        return tostring(statisticsManager.actor_statistic.founded_secrets);
      default:
        return "";
    }
  }

  public getBestKilledMonster() {
    const bestKilledMonster: Optional<TMonster> = StatisticsManager.getInstance().actor_statistic.best_monster;

    return bestKilledMonster && killedMonsters[bestKilledMonster] ? killedMonsters[bestKilledMonster] : null;
  }

  public getMonsterBackground(): string {
    return this.getBestKilledMonster()?.back || "";
  }

  public getMonsterIcon(): string {
    return this.getBestKilledMonster()?.icon || "";
  }

  public getFavoriteWeapon(): TWeapon {
    return StatisticsManager.getInstance().actor_statistic.favorite_weapon_sect || weapons.wpn_knife;
  }

  public fillFactionState(state: Record<string, any>): void {
    logger.info("Fill faction state");

    // const board = get_global("sim_board").get_sim_board();

    state.member_count = 0;
    state.resource = 0;
    state.power = 0;

    state.actor_goodwill = 3000;
    state.name = "ui_inGame2_hint_wnd_bar";
    state.icon = "ui_inGame2_hint_wnd_bar";
    state.icon_big = "logos_big_empty";
    state.target = game.translate_string("ui_st_no_faction");
    state.target_desc = "aaa";
    state.location = "a";

    state.war_state1 = "a";
    state.war_state_hint1 = "1";
    state.war_state2 = "3";
    state.war_state_hint2 = "2";
    state.war_state3 = "33";
    state.war_state_hint3 = "";
    state.war_state4 = "23";
    state.war_state_hint4 = "";
    state.war_state5 = "5";
    state.war_state_hint5 = "5";

    state.bonus = 0;
  }
}
