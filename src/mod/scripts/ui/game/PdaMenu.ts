import { alife_infos } from "@/mod/globals/alife_infos";
import { captions } from "@/mod/globals/captions";
import { levels } from "@/mod/globals/levels";
import { monsters, TMonster } from "@/mod/globals/monsters";
import { story_ids } from "@/mod/globals/story_ids";
import { textures } from "@/mod/globals/textures";
import { weapons } from "@/mod/globals/weapons";
import { Optional } from "@/mod/lib/types";
import { hasAlifeInfo } from "@/mod/scripts/utils/actor";
import { getStoryObjectId } from "@/mod/scripts/utils/alife";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("PdaMenu");

const changeObjects = [
  {
    target: story_ids.jup_b32_spot,
    hint: captions.st_jup_b32_name,
    zone: "jup_b32_anomal_zone",
    group: alife_infos.jup_b32_scanner_1_placed,
    enabled: false
  },
  {
    target: story_ids.jup_b201_spot,
    hint: captions.st_jup_b201_name,
    zone: "jup_b201_anomal_zone",
    group: alife_infos.jup_b32_scanner_2_placed,
    enabled: false
  },
  {
    target: story_ids.jup_b209_spot,
    hint: captions.st_jup_b209_name,
    zone: "jup_b209_anomal_zone",
    group: alife_infos.jup_b32_scanner_3_placed,
    enabled: false
  },
  {
    target: story_ids.jup_b211_spot,
    hint: captions.st_jup_b211_name,
    zone: "jup_b211_anomal_zone",
    group: alife_infos.jup_b32_scanner_4_placed,
    enabled: false
  },
  {
    target: story_ids.jup_b1_spot,
    hint: captions.st_jup_b1_name,
    zone: "jup_b10_anomal_zone",
    group: alife_infos.jup_b32_scanner_5_placed,
    enabled: false
  }
];

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

const primaryMapObjects = [
  { target: story_ids.zat_b55_spot, hint: captions.st_zat_b55_name },
  { target: story_ids.zat_b100_spot, hint: captions.st_zat_b100_name },
  { target: story_ids.zat_b104_spot, hint: captions.st_zat_b104_name },
  { target: story_ids.zat_b38_spot, hint: captions.st_zat_b38_name },
  { target: story_ids.zat_b40_spot, hint: captions.st_zat_b40_name },
  { target: story_ids.zat_b56_spot, hint: captions.st_zat_b56_name },
  { target: story_ids.zat_b5_spot, hint: captions.st_zat_b5_name },
  { target: story_ids.zat_a2_spot, hint: captions.st_zat_a2_name },
  { target: story_ids.zat_b20_spot, hint: captions.st_zat_b20_name },
  { target: story_ids.zat_b53_spot, hint: captions.st_zat_b53_name },
  { target: story_ids.zat_b101_spot, hint: captions.st_zat_b101_name },
  { target: story_ids.zat_b106_spot, hint: captions.st_zat_b106_name },
  { target: story_ids.zat_b7_spot, hint: captions.st_zat_b7_name },
  { target: story_ids.zat_b14_spot, hint: captions.st_zat_b14_name },
  { target: story_ids.zat_b52_spot, hint: captions.st_zat_b52_name },
  { target: story_ids.zat_b39_spot, hint: captions.st_zat_b39_name },
  { target: story_ids.zat_b33_spot, hint: captions.st_zat_b33_name },
  { target: story_ids.zat_b18_spot, hint: captions.st_zat_b18_name },
  { target: story_ids.zat_b54_spot, hint: captions.st_zat_b54_name },
  { target: story_ids.zat_b12_spot, hint: captions.st_zat_b12_name },
  { target: story_ids.zat_b28_spot, hint: captions.st_zat_b28_name },
  { target: story_ids.zat_b103_spot, hint: captions.st_zat_b103_name },

  { target: story_ids.jup_b1_spot, hint: captions.st_jup_b1_name },
  { target: story_ids.jup_b46_spot, hint: captions.st_jup_b46_name },
  { target: story_ids.jup_b202_spot, hint: captions.st_jup_b202_name },
  { target: story_ids.jup_b211_spot, hint: captions.st_jup_b211_name },
  { target: story_ids.jup_b200_spot, hint: captions.st_jup_b200_name },
  { target: story_ids.jup_b19_spot, hint: captions.st_jup_b19_name },
  { target: story_ids.jup_a6_spot, hint: captions.st_jup_a6_name },
  { target: story_ids.jup_b25_spot, hint: captions.st_jup_b25_name },
  { target: story_ids.jup_b6_spot, hint: captions.st_jup_b6_name },
  { target: story_ids.jup_b205_spot, hint: captions.st_jup_b205_name },
  { target: story_ids.jup_b206_spot, hint: captions.st_jup_b206_name },
  { target: story_ids.jup_b32_spot, hint: captions.st_jup_b32_name },
  { target: story_ids.jup_a10_spot, hint: captions.st_jup_a10_name },
  { target: story_ids.jup_b209_spot, hint: captions.st_jup_b209_name },
  { target: story_ids.jup_b208_spot, hint: captions.st_jup_b208_name },
  { target: story_ids.jup_a12_spot, hint: captions.st_jup_a12_name },
  { target: story_ids.jup_b212_spot, hint: captions.st_jup_b212_name },
  { target: story_ids.jup_b9_spot, hint: captions.st_jup_b9_name },
  { target: story_ids.jup_b201_spot, hint: captions.st_jup_b201_name },
  { target: story_ids.jup_a9_spot, hint: captions.st_jup_a9_name },

  { target: story_ids.pri_a28_spot, hint: captions.st_pri_a28_name },
  { target: story_ids.pri_b36_spot, hint: captions.st_pri_b36_name },
  { target: story_ids.pri_b303_spot, hint: captions.st_pri_b303_name },
  { target: story_ids.pri_b301_spot, hint: captions.st_pri_b301_name },
  { target: story_ids.pri_a17_spot, hint: captions.st_pri_a17_name },
  { target: story_ids.pri_b306_spot, hint: captions.st_pri_b306_name },
  { target: story_ids.pri_a16_spot, hint: captions.st_pri_a16_name },
  { target: story_ids.pri_a25_spot, hint: captions.st_pri_a25_name },
  { target: story_ids.pri_b35_spot, hint: captions.st_pri_b35_name },
  { target: story_ids.pri_a21_spot, hint: captions.st_pri_a21_name },
  { target: story_ids.pri_b304_spot, hint: captions.st_pri_b304_name },
  { target: story_ids.pri_a18_spot, hint: captions.st_pri_a18_name }
];

const sleepZones = [
  { target: story_ids.zat_a2_sr_sleep_id, hint: captions.st_ui_pda_sleep_place },
  { target: story_ids.jup_a6_sr_sleep_id, hint: captions.st_ui_pda_sleep_place },
  { target: story_ids.pri_a16_sr_sleep_id, hint: captions.st_ui_pda_sleep_place }
];

export class PdaMenu {
  public static readonly DISTANCE_TO_SHOW_MAP_MARKS: number = 75;
  public static readonly UPDATES_THROTTLE: number = 10_000;

  private static instance: Optional<PdaMenu> = null;

  public static getInstance(): PdaMenu {
    if (!this.instance) {
      this.instance = new PdaMenu();
    }

    return this.instance;
  }

  public isInitialized: boolean = false;
  public lastUpdateAt: number = 0;

  public updateAnomaliesZones(): void {
    if (hasAlifeInfo(alife_infos.jup_b32_scanner_reward)) {
      changeObjects.forEach((it) => {
        if (hasAlifeInfo(it.group)) {
          it.enabled = true;
        }
      });
    }

    /**
     * Update artefacts loot display in zones with artefacts.
     * Works for jupiter only.
     */
    if (level.name() === levels.jupiter) {
      for (const [k, v] of pairs(changeObjects as LuaIterable<number, any>)) {
        if (v.enabled) {
          const objectId: Optional<number> = getStoryObjectId(v.target);

          let hint: string = game.translate_string(v.hint) + "\\n" + " \\n";
          const [has_af, af_table] = get_global("xr_conditions").anomaly_has_artefact(db.actor, null, [v.zone]);

          if (has_af) {
            hint = hint + game.translate_string(captions.st_jup_b32_has_af);
            for (const [k, v] of pairs(af_table as LuaIterable<string, any>)) {
              hint = hint + "\\n" + game.translate_string("st_" + v + "_name");
            }
          } else {
            hint = hint + game.translate_string(captions.st_jup_b32_no_af);
          }

          /**
           * Add artifacts info in hotspots.
           */
          if (objectId && level.map_has_object_spot(objectId, "primary_object") !== 0) {
            level.map_remove_object_spot(objectId, "primary_object");
            level.map_add_object_spot(objectId, "primary_object", hint);
          }
        }
      }
    }
  }

  public getStat(index: number): string {
    const stats: Record<string, any> = get_global("xr_statistic");

    switch (index) {
      case 0:
        return "00:00:00";
      case 2:
        return tostring(stats.actor_statistic.surges);
      case 3:
        return tostring(stats.actor_statistic.killed_monsters);
      case 4:
        return tostring(stats.actor_statistic.killed_stalkers);
      case 5:
        return tostring(stats.actor_statistic.artefacts_founded);
      case 6:
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
    const favoriteWeapon: Optional<TMonster> = get_global("xr_statistic").actor_statistic.best_monster;

    return favoriteWeapon || weapons.wpn_knife;
  }

  public fillFactionState(state: Record<string, any>): void {
    log.info("Fill faction state");

    const board = get_global("sim_board").get_sim_board();

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

  public fillPrimaryObjects(): void {
    log.info("Fill primary objects");

    primaryMapObjects.forEach((it) => {
      const objectId: Optional<number> = getStoryObjectId(it.target);

      if (objectId) {
        level.map_add_object_spot(objectId, "primary_object", it.hint);
      }
    });

    this.updateAnomaliesZones();
    this.fillSleepZones();
  }

  public fillSleepZones(): void {
    sleepZones.forEach((it) => {
      const objectId: Optional<number> = getStoryObjectId(it.target);
      const storedObject: Optional<{ object: XR_game_object }> = objectId ? db.storage[objectId] : null;

      if (objectId && storedObject && storedObject.object) {
        const actorPosition: XR_vector = db.actor.position();
        const distanceFromActor: number = storedObject.object.position().distance_to(actorPosition);
        const hasSleepSpot: boolean = level.map_has_object_spot(objectId, "ui_pda2_actor_sleep_location") !== 0;

        if (distanceFromActor <= PdaMenu.DISTANCE_TO_SHOW_MAP_MARKS && !hasSleepSpot) {
          level.map_add_object_spot(objectId, "ui_pda2_actor_sleep_location", it.hint);
        } else if (distanceFromActor > PdaMenu.DISTANCE_TO_SHOW_MAP_MARKS && hasSleepSpot) {
          level.map_remove_object_spot(objectId, "ui_pda2_actor_sleep_location");
        }
      }
    });
  }

  public onActorPositionUpdate(): void {
    const now: number = time_global();

    if (!this.isInitialized) {
      this.fillPrimaryObjects();
      this.isInitialized = true;
    }

    if (now - this.lastUpdateAt >= PdaMenu.UPDATES_THROTTLE) {
      this.fillSleepZones();
      this.lastUpdateAt = now;
    }
  }
}

export const pdaMenu: PdaMenu = PdaMenu.getInstance();
