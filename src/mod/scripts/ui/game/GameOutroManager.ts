import { game, get_hud, sound_object, XR_CUIGameCustom, XR_sound_object } from "xray16";

import { game_tutorials } from "@/mod/globals/game_tutorials";
import { sounds } from "@/mod/globals/sound/sounds";
import { AnyCallablesModule, Optional } from "@/mod/lib/types";
import { getActor } from "@/mod/scripts/core/db";
import { AbstractCoreManager } from "@/mod/scripts/core/managers/AbstractCoreManager";
import { hasAlifeInfo } from "@/mod/scripts/utils/actor";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("GameOutroManager");
const volume_max: number = 1.0;
const volume_min: number = 0.3;

/**
 * todo
 */
export class GameOutroManager extends AbstractCoreManager {
  public static calc_fade(
    factor: number,
    fade1_pos: number,
    fade2_pos: number,
    fade1_volume: number,
    fade2_volume: number
  ): number {
    let f = ((factor - fade1_pos) * (fade2_volume - fade1_volume)) / (fade2_pos - fade1_pos) + fade1_volume;

    let min_vol = 0.0;
    let max_vol = 1.0;

    if (fade1_volume > fade2_volume) {
      max_vol = fade1_volume;
      min_vol = fade2_volume;
    } else {
      max_vol = fade2_volume;
      min_vol = fade1_volume;
    }

    if (f > max_vol) {
      f = max_vol;
    } else if (f < min_vol) {
      f = min_vol;
    }

    return f;
  }

  public conditions: Record<string, () => boolean> = {
    // -- 4a
    skadovsk_bad_cond: () => hasAlifeInfo("kingpin_gained"),
    // -- 4b
    skadovsk_good_cond: () => hasAlifeInfo("one_of_the_lads_gained"),
    // -- 4c
    skadovsk_neutral_cond: () => !hasAlifeInfo("kingpin_gained") && !hasAlifeInfo("one_of_the_lads_gained"),
    // -- 5a
    bloodsucker_live_cond: () => !hasAlifeInfo("zat_b57_bloodsucker_lair_clear"),
    // -- 5b
    bloodsucker_dead_cond: () => hasAlifeInfo("zat_b57_bloodsucker_lair_clear"),
    // -- 6a
    dolg_die_cond: () => hasAlifeInfo("sim_freedom_help_harder"),
    // -- 6b
    freedom_die_cond: () => hasAlifeInfo("sim_duty_help_harder"),
    // -- 6c
    dolg_n_freedom_cond: () => !hasAlifeInfo("sim_freedom_help_harder") && !hasAlifeInfo("sim_duty_help_harder"),
    // -- 7a
    scientist_good_cond: () => hasAlifeInfo("research_man_gained"),
    // -- 7b
    scientist_bad_cond: () => !hasAlifeInfo("research_man_gained"),
    // -- 8a
    garik_good_cond: () => hasAlifeInfo("pri_a28_army_leaved_alive"),
    // -- 8b
    garik_bad_cond: () => !hasAlifeInfo("pri_a28_army_leaved_alive"),
    // -- 9
    oasis_cond: () => hasAlifeInfo("jup_b16_oasis_artefact_to_scientist"),
    // -- 10
    mercenarys_cond: () => hasAlifeInfo("pri_b35_task_running"),
    // -- 11a
    yanov_good_cond: () => hasAlifeInfo("mutant_hunter_achievement_gained"),
    // -- 11b
    yanov_bad_cond: () => !hasAlifeInfo("mutant_hunter_achievement_gained"),
    // -- 12a
    zuluz_good_cond: () => hasAlifeInfo("pri_b301_save_zulus_complete"),
    // -- 12b
    zuluz_bad_cond: () => !hasAlifeInfo("pri_b301_save_zulus_complete"),
    // -- 13a
    vano_good_cond: () =>
      hasAlifeInfo("jup_a10_vano_agree_go_und") && hasAlifeInfo("pri_a16_vano_was_alive_when_removed"),
    // -- 13b
    vano_bad_cond: () =>
      hasAlifeInfo("jup_a10_vano_agree_go_und") && !hasAlifeInfo("pri_a16_vano_was_alive_when_removed"),
    // -- 14a
    brodyaga_good_cond: () =>
      hasAlifeInfo("jup_b218_monolith_hired") && hasAlifeInfo("pri_a16_wanderer_was_alive_when_removed"),
    // -- 14b
    brodyaga_bad_cond: () =>
      hasAlifeInfo("jup_b218_monolith_hired") && !hasAlifeInfo("pri_a16_wanderer_was_alive_when_removed"),
    // -- 15a
    sokolov_good_cond: () => hasAlifeInfo("jup_b218_soldier_hired") && hasAlifeInfo("pri_a28_sokolov_left_alive"),
    // -- 15b
    sokolov_bad_cond: () => hasAlifeInfo("jup_b218_soldier_hired") && !hasAlifeInfo("pri_a28_sokolov_left_alive"),
    // -- 16
    sich_cond: () => hasAlifeInfo("balance_advocate_gained"),
    // -- 17
    noahs_ark_cond: () => hasAlifeInfo("zat_b18_noah_met") && !hasAlifeInfo("zat_b18_noah_dead"),
    // -- 18a
    kardan_good_cond: () => hasAlifeInfo("zat_b44_tech_buddies_both_told"),
    // -- 18b
    kardan_bad_cond: () => !hasAlifeInfo("zat_b44_tech_buddies_both_told"),
    // --19a
    strelok_live_cond: () => !hasAlifeInfo("pri_a28_strelok_dead"),
    // -- 19b
    strelok_die_cond: () => hasAlifeInfo("pri_a28_strelok_dead"),
    // -- 20a
    kovalski_live_cond: () => !hasAlifeInfo("pri_a28_koval_dead"),
    // -- 20b
    kovalski_die_cond: () => hasAlifeInfo("pri_a28_koval_dead"),
  };

  public snd: Optional<XR_sound_object> = null;

  public start_outro(): void {
    logger.info("Starting game outro");
    game.start_tutorial(game_tutorials.outro_game);
  }

  public startSound(): void {
    logger.info("start outro sound");
    this.snd = new sound_object(sounds.music_outro);
    this.snd.play(null, 0.0, sound_object.s2d);
    this.setSoundVolume(1.0);
  }

  public stopSound(): void {
    logger.info("Stop outro sound");

    if (this.snd) {
      this.snd.stop();
      this.snd = null;
    }
  }

  public setSoundVolume(volume: number): void {
    if (this.snd) {
      this.snd.volume = volume;
    }
  }

  public start_bk_sound(): void {
    this.startSound();

    const hud: XR_CUIGameCustom = get_hud();

    hud.AddCustomStatic("blackscreen", true);
    get_global<AnyCallablesModule>("xr_effects").disable_ui_only(getActor(), null);
  }

  public stop_bk_sound(): void {
    if (this.stopSound !== null) {
      this.stopSound();
    }

    get_global<AnyCallablesModule>("xr_effects").game_disconnect();
    get_global<AnyCallablesModule>("xr_effects").game_credits();
  }

  public update_bk_sound_fade_start(factor: number): void {
    const start_pt: number = 0.6;
    const stop_pt: number = 1.0;

    this.setSoundVolume(GameOutroManager.calc_fade(factor, start_pt, stop_pt, volume_max, volume_min));
  }

  public update_bk_sound_fade_stop(factor: number): void {
    let f: number = 1.0;

    if (factor < 0.5) {
      const start_pt = 0.0;
      const stop_pt = 0.12;

      f = GameOutroManager.calc_fade(factor, start_pt, stop_pt, volume_min, volume_max);
    } else {
      const start_pt2 = 0.7;
      const stop_pt2 = 0.95;

      f = GameOutroManager.calc_fade(factor, start_pt2, stop_pt2, volume_max, 0.0);
    }

    this.setSoundVolume(f);
  }
}
