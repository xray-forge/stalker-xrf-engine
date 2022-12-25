import { monsters, TMonster } from "@/mod/globals/monsters";
import { textures } from "@/mod/globals/textures";
import { weapons } from "@/mod/globals/weapons";
import { Optional } from "@/mod/lib/types";
import { AbstractSingletonManager } from "@/mod/scripts/core/AbstractSingletonManager";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("PdaMenu");

const killedMonsters = {
  [monsters.bloodsucker_weak]: { back: textures.ui_inGame2_Krovosos, icon: "" },
  [monsters.bloodsucker_normal]: { back: textures.ui_inGame2_Krovosos_1, icon: "" },
  [monsters.bloodsucker_strong]: { back: textures.ui_inGame2_Krovosos_2, icon: "" },
  [monsters.boar_weak]: { back: textures.ui_inGame2_Kaban_1, icon: "" },
  [monsters.boar_strong]: { back: textures.ui_inGame2_Kaban, icon: "" },
  [monsters.burer]: { back: textures.ui_inGame2_Burer, icon: "" },
  [monsters.chimera]: { back: textures.ui_inGame2_Himera, icon: "" },
  [monsters.controller]: { back: textures.ui_inGame2_Controller, icon: "" },
  [monsters.dog]: { back: textures.ui_inGame2_Blind_Dog, icon: "" },
  [monsters.flesh_weak]: { back: textures.ui_inGame2_Flesh, icon: "" },
  [monsters.flesh_strong]: { back: textures.ui_inGame2_Flesh_1, icon: "" },
  [monsters.gigant]: { back: textures.ui_inGame2_Pseudo_Gigant, icon: "" },
  [monsters.poltergeist_tele]: { back: textures.ui_inGame2_Poltergeyst, icon: "" },
  [monsters.poltergeist_flame]: { back: textures.ui_inGame2_Poltergeist_1, icon: "" },
  [monsters.psy_dog_weak]: { back: textures.ui_inGame2_PseudoDog_1, icon: "" },
  [monsters.psy_dog_strong]: { back: textures.ui_inGame2_PseudoDog, icon: "" },
  [monsters.pseudodog_weak]: { back: textures.ui_inGame2_PseudoDog_1, icon: "" },
  [monsters.pseudodog_strong]: { back: textures.ui_inGame2_PseudoDog, icon: "" },
  [monsters.snork]: { back: textures.ui_inGame2_Snork, icon: "" },
  [monsters.tushkano]: { back: textures.ui_inGame2_Tushkan, icon: "" }
};

enum EStatSection {
  UNKNOWN,
  SURGES,
  COMPLETED_QUESTS,
  KILLED_MONSTERS,
  KILLED_STALKERS,
  ARTEFACTS_FOUND,
  SECRETS_FOUND
}

/**
 */
export class PdaMenu extends AbstractSingletonManager {
  public getStat(index: EStatSection): string {
    const stats: Record<string, any> = get_global("xr_statistic");

    switch (index) {
      case EStatSection.UNKNOWN:
        return "00:00:00";
      case EStatSection.SURGES:
        return tostring(stats.actor_statistic.surges);
      case EStatSection.COMPLETED_QUESTS:
        return tostring(stats.actor_statistic.completed_quests);
      case EStatSection.KILLED_MONSTERS:
        return tostring(stats.actor_statistic.killed_monsters);
      case EStatSection.KILLED_STALKERS:
        return tostring(stats.actor_statistic.killed_stalkers);
      case EStatSection.ARTEFACTS_FOUND:
        return tostring(stats.actor_statistic.artefacts_founded);
      case EStatSection.SECRETS_FOUND:
        return tostring(stats.actor_statistic.founded_secrets);
      default:
        return "";
    }
  }

  public getBestKilledMonster() {
    const bestKilledMonster: Optional<TMonster> = get_global("xr_statistic").actor_statistic.best_monster;

    if (!bestKilledMonster || !killedMonsters[bestKilledMonster]) {
      return null;
    } else {
      return killedMonsters[bestKilledMonster];
    }
  }

  public getMonsterBackground(): string {
    return this.getBestKilledMonster()?.back || "";
  }

  public getMonsterIcon(): string {
    return this.getBestKilledMonster()?.icon || "";
  }

  public getFavoriteWeapon(): string {
    const favoriteWeapon: Optional<TMonster> = get_global("xr_statistic").actor_statistic.favorite_weapon_sect;

    return favoriteWeapon || weapons.wpn_knife;
  }

  public fillFactionState(state: Record<string, any>): void {
    log.info("Fill faction state");

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

export const pdaMenu: PdaMenu = PdaMenu.getInstance() as PdaMenu;
