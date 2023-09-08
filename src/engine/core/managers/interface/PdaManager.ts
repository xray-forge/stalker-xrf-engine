import { game } from "xray16";

import { AbstractCoreManager } from "@/engine/core/managers/base/AbstractCoreManager";
import { StatisticsManager } from "@/engine/core/managers/interface/statistics";
import { LuaLogger } from "@/engine/core/utils/logging";
import { TWeapon, weapons } from "@/engine/lib/constants/items/weapons";
import { monsters, TMonster } from "@/engine/lib/constants/monsters";
import { Optional, PartialRecord, TLabel, TName } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

const killedMonsters: PartialRecord<TMonster, { back: TName; icon: TName }> = {
  [monsters.bloodsucker_weak]: { back: "ui_inGame2_Krovosos", icon: "" },
  [monsters.bloodsucker_normal]: { back: "ui_inGame2_Krovosos_1", icon: "" },
  [monsters.bloodsucker_strong]: { back: "ui_inGame2_Krovosos_2", icon: "" },
  [monsters.boar_weak]: { back: "ui_inGame2_Kaban_1", icon: "" },
  [monsters.boar_strong]: { back: "ui_inGame2_Kaban", icon: "" },
  [monsters.burer]: { back: "ui_inGame2_Burer", icon: "" },
  [monsters.chimera]: { back: "ui_inGame2_Himera", icon: "" },
  [monsters.controller]: { back: "ui_inGame2_Controller", icon: "" },
  [monsters.dog]: { back: "ui_inGame2_Blind_Dog", icon: "" },
  [monsters.flesh_weak]: { back: "ui_inGame2_Flesh", icon: "" },
  [monsters.flesh_strong]: { back: "ui_inGame2_Flesh_1", icon: "" },
  [monsters.gigant]: { back: "ui_inGame2_Pseudo_Gigant", icon: "" },
  [monsters.poltergeist_tele]: { back: "ui_inGame2_Poltergeyst", icon: "" },
  [monsters.poltergeist_flame]: { back: "ui_inGame2_Poltergeist_1", icon: "" },
  [monsters.psy_dog_weak]: { back: "ui_inGame2_PseudoDog_1", icon: "" },
  [monsters.psy_dog_strong]: { back: "ui_inGame2_PseudoDog", icon: "" },
  [monsters.pseudodog_weak]: { back: "ui_inGame2_PseudoDog_1", icon: "" },
  [monsters.pseudodog_strong]: { back: "ui_inGame2_PseudoDog", icon: "" },
  [monsters.snork]: { back: "ui_inGame2_Snork", icon: "" },
  [monsters.tushkano]: { back: "ui_inGame2_Tushkan", icon: "" },
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
  public getStat(section: EStatSection): TLabel {
    const statisticsManager: StatisticsManager = StatisticsManager.getInstance();

    switch (section) {
      case EStatSection.UNKNOWN:
        return "00:00:00";
      case EStatSection.SURGES:
        return tostring(statisticsManager.actorStatistics.surgesCount);
      case EStatSection.COMPLETED_QUESTS:
        return tostring(statisticsManager.actorStatistics.completedTasksCount);
      case EStatSection.KILLED_MONSTERS:
        return tostring(statisticsManager.actorStatistics.killedMonstersCount);
      case EStatSection.KILLED_STALKERS:
        return tostring(statisticsManager.actorStatistics.killedStalkersCount);
      case EStatSection.ARTEFACTS_FOUND:
        return tostring(statisticsManager.actorStatistics.collectedArtefactsCount);
      case EStatSection.SECRETS_FOUND:
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

    return bestKilledMonster && killedMonsters[bestKilledMonster] ? killedMonsters[bestKilledMonster] : null;
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
  public getFavoriteWeapon(): TWeapon {
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
