import { game } from "xray16";

import { AbstractManager } from "@/engine/core/managers/base/AbstractManager";
import { EPdaStatSection, killedMonstersDisplay } from "@/engine/core/managers/pda/pda_types";
import { StatisticsManager } from "@/engine/core/managers/statistics";
import { LuaLogger } from "@/engine/core/utils/logging";
import { weapons } from "@/engine/lib/constants/items/weapons";
import { TMonster } from "@/engine/lib/constants/monsters";
import { Optional, TLabel, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class PdaManager extends AbstractManager {
  public getStat(section: EPdaStatSection): TLabel {
    const statisticsManager: StatisticsManager = StatisticsManager.getInstance();

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
   * todo: Description.
   */
  public getBestKilledMonster() {
    const bestKilledMonster: Optional<TMonster> = StatisticsManager.getInstance().actorStatistics.bestKilledMonster;

    return bestKilledMonster && killedMonstersDisplay[bestKilledMonster]
      ? killedMonstersDisplay[bestKilledMonster]
      : null;
  }

  /**
   * todo: Description.
   */
  public getMonsterBackground(): TLabel {
    return this.getBestKilledMonster()?.back || "";
  }

  /**
   * todo: Description.
   */
  public getMonsterIcon(): TLabel {
    return this.getBestKilledMonster()?.icon || "";
  }

  /**
   * todo: Description.
   */
  public getFavoriteWeapon(): TSection {
    return StatisticsManager.getInstance().actorStatistics.favoriteWeapon || weapons.wpn_knife;
  }

  /**
   * todo: Description.
   */
  public fillFactionState(state: Record<string, any>): void {
    logger.info("Fill faction state");

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
