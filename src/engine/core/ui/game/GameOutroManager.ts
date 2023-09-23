import { CUIGameCustom, game, get_hud, sound_object } from "xray16";

import { ActorInputManager } from "@/engine/core/managers/actor";
import { AbstractManager } from "@/engine/core/managers/base/AbstractManager";
import { getExtern } from "@/engine/core/utils/binding";
import { LuaLogger } from "@/engine/core/utils/logging";
import { hasAlifeInfo } from "@/engine/core/utils/object/object_info_portion";
import { gameTutorials } from "@/engine/lib/constants/game_tutorials";
import { infoPortions } from "@/engine/lib/constants/info_portions";
import { AnyCallablesModule, ESoundObjectType, Optional, SoundObject, TName, TRate } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

const VOLUME_MAX: TRate = 1.0;
const VOLUME_MIN: TRate = 0.3;

/**
 * todo
 */
export class GameOutroManager extends AbstractManager {
  /**
   * todo;
   * todo: Use utils to check multiple
   */
  public static readonly OUTRO_CONDITIONS: Record<TName, () => boolean> = {
    // -- 4a
    skadovsk_bad_cond: () => hasAlifeInfo(infoPortions.kingpin_gained),
    // -- 4b
    skadovsk_good_cond: () => hasAlifeInfo(infoPortions.one_of_the_lads_gained),
    // -- 4c
    skadovsk_neutral_cond: () =>
      !hasAlifeInfo(infoPortions.kingpin_gained) && !hasAlifeInfo(infoPortions.one_of_the_lads_gained),
    // -- 5a
    bloodsucker_live_cond: () => !hasAlifeInfo(infoPortions.zat_b57_bloodsucker_lair_clear),
    // -- 5b
    bloodsucker_dead_cond: () => hasAlifeInfo(infoPortions.zat_b57_bloodsucker_lair_clear),
    // -- 6a
    dolg_die_cond: () => hasAlifeInfo(infoPortions.sim_freedom_help_harder),
    // -- 6b
    freedom_die_cond: () => hasAlifeInfo(infoPortions.sim_duty_help_harder),
    // -- 6c
    dolg_n_freedom_cond: () =>
      !hasAlifeInfo(infoPortions.sim_freedom_help_harder) && !hasAlifeInfo(infoPortions.sim_duty_help_harder),
    // -- 7a
    scientist_good_cond: () => hasAlifeInfo(infoPortions.research_man_gained),
    // -- 7b
    scientist_bad_cond: () => !hasAlifeInfo(infoPortions.research_man_gained),
    // -- 8a
    garik_good_cond: () => hasAlifeInfo(infoPortions.pri_a28_army_leaved_alive),
    // -- 8b
    garik_bad_cond: () => !hasAlifeInfo(infoPortions.pri_a28_army_leaved_alive),
    // -- 9
    oasis_cond: () => hasAlifeInfo(infoPortions.jup_b16_oasis_artefact_to_scientist),
    // -- 10
    mercenarys_cond: () => hasAlifeInfo(infoPortions.pri_b35_task_running),
    // -- 11a
    yanov_good_cond: () => hasAlifeInfo(infoPortions.mutant_hunter_achievement_gained),
    // -- 11b
    yanov_bad_cond: () => !hasAlifeInfo(infoPortions.mutant_hunter_achievement_gained),
    // -- 12a
    zuluz_good_cond: () => hasAlifeInfo(infoPortions.pri_b301_save_zulus_complete),
    // -- 12b
    zuluz_bad_cond: () => !hasAlifeInfo(infoPortions.pri_b301_save_zulus_complete),
    // -- 13a
    vano_good_cond: () =>
      hasAlifeInfo(infoPortions.jup_a10_vano_agree_go_und) &&
      hasAlifeInfo(infoPortions.pri_a16_vano_was_alive_when_removed),
    // -- 13b
    vano_bad_cond: () =>
      hasAlifeInfo(infoPortions.jup_a10_vano_agree_go_und) &&
      !hasAlifeInfo(infoPortions.pri_a16_vano_was_alive_when_removed),
    // -- 14a
    brodyaga_good_cond: () =>
      hasAlifeInfo(infoPortions.jup_b218_monolith_hired) &&
      hasAlifeInfo(infoPortions.pri_a16_wanderer_was_alive_when_removed),
    // -- 14b
    brodyaga_bad_cond: () =>
      hasAlifeInfo(infoPortions.jup_b218_monolith_hired) &&
      !hasAlifeInfo(infoPortions.pri_a16_wanderer_was_alive_when_removed),
    // -- 15a
    sokolov_good_cond: () =>
      hasAlifeInfo(infoPortions.jup_b218_soldier_hired) && hasAlifeInfo(infoPortions.pri_a28_sokolov_left_alive),
    // -- 15b
    sokolov_bad_cond: () =>
      hasAlifeInfo(infoPortions.jup_b218_soldier_hired) && !hasAlifeInfo(infoPortions.pri_a28_sokolov_left_alive),
    // -- 16
    sich_cond: () => hasAlifeInfo(infoPortions.balance_advocate_gained),
    // -- 17
    noahs_ark_cond: () => hasAlifeInfo(infoPortions.zat_b18_noah_met) && !hasAlifeInfo(infoPortions.zat_b18_noah_dead),
    // -- 18a
    kardan_good_cond: () => hasAlifeInfo(infoPortions.zat_b44_tech_buddies_both_told),
    // -- 18b
    kardan_bad_cond: () => !hasAlifeInfo(infoPortions.zat_b44_tech_buddies_both_told),
    // --19a
    strelok_live_cond: () => !hasAlifeInfo(infoPortions.pri_a28_strelok_dead),
    // -- 19b
    strelok_die_cond: () => hasAlifeInfo(infoPortions.pri_a28_strelok_dead),
    // -- 20a
    kovalski_live_cond: () => !hasAlifeInfo(infoPortions.pri_a28_koval_dead),
    // -- 20b
    kovalski_die_cond: () => hasAlifeInfo(infoPortions.pri_a28_koval_dead),
  };

  public static calcFade(
    factor: number,
    fade1Pos: number,
    fade2Pos: number,
    fade1Volume: number,
    fade2Volume: number
  ): number {
    let f: TRate = ((factor - fade1Pos) * (fade2Volume - fade1Volume)) / (fade2Pos - fade1Pos) + fade1Volume;

    let minVol: TRate = 0.0;
    let maxVol: TRate = 1.0;

    if (fade1Volume > fade2Volume) {
      maxVol = fade1Volume;
      minVol = fade2Volume;
    } else {
      maxVol = fade2Volume;
      minVol = fade1Volume;
    }

    if (f > maxVol) {
      f = maxVol;
    } else if (f < minVol) {
      f = minVol;
    }

    return f;
  }

  public sound: Optional<SoundObject> = null;

  public startOutro(): void {
    logger.info("Starting game outro");
    game.start_tutorial(gameTutorials.outro_game);
  }

  public startSound(): void {
    logger.info("start outro sound");
    this.sound = new sound_object("music_outro");
    this.sound.play(null, 0.0, ESoundObjectType.S2D);
    this.setSoundVolume(1.0);
  }

  public stopSound(): void {
    logger.info("Stop outro sound");

    if (this.sound) {
      this.sound.stop();
      this.sound = null;
    }
  }

  public setSoundVolume(volume: number): void {
    if (this.sound) {
      this.sound.volume = volume;
    }
  }

  public startBkSound(): void {
    this.startSound();

    const hud: CUIGameCustom = get_hud();

    hud.AddCustomStatic("blackscreen", true);
    ActorInputManager.getInstance().disableGameUiOnly();
  }

  public stopBkSound(): void {
    if (this.stopSound !== null) {
      this.stopSound();
    }

    getExtern<AnyCallablesModule>("xr_effects").game_disconnect();
    getExtern<AnyCallablesModule>("xr_effects").game_credits();
  }

  public updateBkSoundFadeStart(factor: number): void {
    const startPt: number = 0.6;
    const stopPt: number = 1.0;

    this.setSoundVolume(GameOutroManager.calcFade(factor, startPt, stopPt, VOLUME_MAX, VOLUME_MIN));
  }

  public updateBkSoundFadeStop(factor: number): void {
    let f: number = 1.0;

    if (factor < 0.5) {
      const startPt: TRate = 0.0;
      const stopPt: TRate = 0.12;

      f = GameOutroManager.calcFade(factor, startPt, stopPt, VOLUME_MIN, VOLUME_MAX);
    } else {
      const startPt2: TRate = 0.7;
      const stopPt2: TRate = 0.95;

      f = GameOutroManager.calcFade(factor, startPt2, stopPt2, VOLUME_MAX, 0.0);
    }

    this.setSoundVolume(f);
  }
}
