import { game } from "xray16";

import { getManager } from "@/engine/core/database";
import { AbstractManager } from "@/engine/core/managers/abstract";
import { EPdaStatSection, iconByKilledMonsters } from "@/engine/core/managers/pda/pda_types";
import { StatisticsManager } from "@/engine/core/managers/statistics";
import { weapons } from "@/engine/lib/constants/items/weapons";
import { TMonster } from "@/engine/lib/constants/monsters";
import { Optional, TLabel, TName, TSection } from "@/engine/lib/types";

/**
 * Manager handling PDA ui / displayed information.
 */
export class PdaManager extends AbstractManager {
  /**
   * @param section - PDA statistics section to get label for
   * @returns section label
   */
  public getStatisticsLabel(section: EPdaStatSection): TLabel {
    const statisticsManager: StatisticsManager = getManager(StatisticsManager);

    switch (section) {
      case EPdaStatSection.UNKNOWN:
        return "00:00:00";
      case EPdaStatSection.SURGES:
        return tostring(statisticsManager.actorStatistics.surgesCount);
      case EPdaStatSection.COMPLETED_QUESTS:
        return tostring(statisticsManager.actorStatistics.completedTasksCount);
      case EPdaStatSection.KILLED_MONSTERS:
        return tostring(statisticsManager.actorStatistics.killedMonstersCount);
      case EPdaStatSection.KILLED_STALKERS:
        return tostring(statisticsManager.actorStatistics.killedStalkersCount);
      case EPdaStatSection.ARTEFACTS_FOUND:
        return tostring(statisticsManager.actorStatistics.collectedArtefactsCount);
      case EPdaStatSection.SECRETS_FOUND:
        return tostring(statisticsManager.actorStatistics.collectedTreasuresCount);
      default:
        return "";
    }
  }

  /**
   * @returns best killed monster icon path
   */
  public getMonsterBackground(): TName {
    const bestKilledMonster: Optional<TMonster> = getManager(StatisticsManager).actorStatistics.bestKilledMonster;

    if (bestKilledMonster) {
      return iconByKilledMonsters[bestKilledMonster] ?? "";
    } else {
      return "";
    }
  }

  /**
   * @returns most used actor weapon
   */
  public getFavoriteWeapon(): TSection {
    return getManager(StatisticsManager).actorStatistics.favoriteWeapon ?? weapons.wpn_knife;
  }

  /**
   * Fill faction state.
   * todo: Faction warfare from CS?
   *
   * @param state - state object to fill
   * @returns updated state object
   */
  public fillFactionState(state: Record<string, string | number>): Record<string, string | number> {
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

    return state;
  }
}
