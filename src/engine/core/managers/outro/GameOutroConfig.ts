import { hasInfoPortion } from "@/engine/core/utils/info_portion";
import { infoPortions } from "@/engine/lib/constants/info_portions";

export const gameOutroConfig = {
  VOLUME_MAX: 1.0,
  VOLUME_MIN: 0.3,
  /**
   * todo: Use utils to check multiple conditions at once
   */
  OUTRO_CONDITIONS: {
    // -- 4a
    skadovsk_bad_cond: () => hasInfoPortion(infoPortions.kingpin_gained),
    // -- 4b
    skadovsk_good_cond: () => hasInfoPortion(infoPortions.one_of_the_lads_gained),
    // -- 4c
    skadovsk_neutral_cond: () =>
      !hasInfoPortion(infoPortions.kingpin_gained) && !hasInfoPortion(infoPortions.one_of_the_lads_gained),
    // -- 5a
    bloodsucker_live_cond: () => !hasInfoPortion(infoPortions.zat_b57_bloodsucker_lair_clear),
    // -- 5b
    bloodsucker_dead_cond: () => hasInfoPortion(infoPortions.zat_b57_bloodsucker_lair_clear),
    // -- 6a
    dolg_die_cond: () => hasInfoPortion(infoPortions.sim_freedom_help_harder),
    // -- 6b
    freedom_die_cond: () => hasInfoPortion(infoPortions.sim_duty_help_harder),
    // -- 6c
    dolg_n_freedom_cond: () =>
      !hasInfoPortion(infoPortions.sim_freedom_help_harder) && !hasInfoPortion(infoPortions.sim_duty_help_harder),
    // -- 7a
    scientist_good_cond: () => hasInfoPortion(infoPortions.research_man_gained),
    // -- 7b
    scientist_bad_cond: () => !hasInfoPortion(infoPortions.research_man_gained),
    // -- 8a
    garik_good_cond: () => hasInfoPortion(infoPortions.pri_a28_army_leaved_alive),
    // -- 8b
    garik_bad_cond: () => !hasInfoPortion(infoPortions.pri_a28_army_leaved_alive),
    // -- 9
    oasis_cond: () => hasInfoPortion(infoPortions.jup_b16_oasis_artefact_to_scientist),
    // -- 10
    mercenarys_cond: () => hasInfoPortion(infoPortions.pri_b35_task_running),
    // -- 11a
    yanov_good_cond: () => hasInfoPortion(infoPortions.mutant_hunter_achievement_gained),
    // -- 11b
    yanov_bad_cond: () => !hasInfoPortion(infoPortions.mutant_hunter_achievement_gained),
    // -- 12a
    zuluz_good_cond: () => hasInfoPortion(infoPortions.pri_b301_save_zulus_complete),
    // -- 12b
    zuluz_bad_cond: () => !hasInfoPortion(infoPortions.pri_b301_save_zulus_complete),
    // -- 13a
    vano_good_cond: () =>
      hasInfoPortion(infoPortions.jup_a10_vano_agree_go_und) &&
      hasInfoPortion(infoPortions.pri_a16_vano_was_alive_when_removed),
    // -- 13b
    vano_bad_cond: () =>
      hasInfoPortion(infoPortions.jup_a10_vano_agree_go_und) &&
      !hasInfoPortion(infoPortions.pri_a16_vano_was_alive_when_removed),
    // -- 14a
    brodyaga_good_cond: () =>
      hasInfoPortion(infoPortions.jup_b218_monolith_hired) &&
      hasInfoPortion(infoPortions.pri_a16_wanderer_was_alive_when_removed),
    // -- 14b
    brodyaga_bad_cond: () =>
      hasInfoPortion(infoPortions.jup_b218_monolith_hired) &&
      !hasInfoPortion(infoPortions.pri_a16_wanderer_was_alive_when_removed),
    // -- 15a
    sokolov_good_cond: () =>
      hasInfoPortion(infoPortions.jup_b218_soldier_hired) && hasInfoPortion(infoPortions.pri_a28_sokolov_left_alive),
    // -- 15b
    sokolov_bad_cond: () =>
      hasInfoPortion(infoPortions.jup_b218_soldier_hired) && !hasInfoPortion(infoPortions.pri_a28_sokolov_left_alive),
    // -- 16
    sich_cond: () => hasInfoPortion(infoPortions.balance_advocate_gained),
    // -- 17
    noahs_ark_cond: () =>
      hasInfoPortion(infoPortions.zat_b18_noah_met) && !hasInfoPortion(infoPortions.zat_b18_noah_dead),
    // -- 18a
    kardan_good_cond: () => hasInfoPortion(infoPortions.zat_b44_tech_buddies_both_told),
    // -- 18b
    kardan_bad_cond: () => !hasInfoPortion(infoPortions.zat_b44_tech_buddies_both_told),
    // --19a
    strelok_live_cond: () => !hasInfoPortion(infoPortions.pri_a28_strelok_dead),
    // -- 19b
    strelok_die_cond: () => hasInfoPortion(infoPortions.pri_a28_strelok_dead),
    // -- 20a
    kovalski_live_cond: () => !hasInfoPortion(infoPortions.pri_a28_koval_dead),
    // -- 20b
    kovalski_die_cond: () => hasInfoPortion(infoPortions.pri_a28_koval_dead),
  },
};
