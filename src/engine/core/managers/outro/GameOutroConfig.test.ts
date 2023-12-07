import { beforeEach, describe, expect, it } from "@jest/globals";

import { gameOutroConfig } from "@/engine/core/managers/outro/GameOutroConfig";
import { giveInfoPortion } from "@/engine/core/utils/info_portion";
import { infoPortions } from "@/engine/lib/constants/info_portions";
import { mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

describe("GameOutroConfig game end conditions", () => {
  beforeEach(() => {
    resetRegistry();
    mockRegisteredActor();
  });

  it("should correctly check skadovsk condition", () => {
    expect(gameOutroConfig.OUTRO_CONDITIONS.skadovsk_bad_cond()).toBe(false);
    expect(gameOutroConfig.OUTRO_CONDITIONS.skadovsk_good_cond()).toBe(false);
    expect(gameOutroConfig.OUTRO_CONDITIONS.skadovsk_neutral_cond()).toBe(true);

    giveInfoPortion(infoPortions.kingpin_gained);
    expect(gameOutroConfig.OUTRO_CONDITIONS.skadovsk_bad_cond()).toBe(true);

    giveInfoPortion(infoPortions.one_of_the_lads_gained);
    expect(gameOutroConfig.OUTRO_CONDITIONS.skadovsk_good_cond()).toBe(true);
  });

  it("should correctly check bloodsuckers condition", () => {
    expect(gameOutroConfig.OUTRO_CONDITIONS.bloodsucker_live_cond()).toBe(true);
    expect(gameOutroConfig.OUTRO_CONDITIONS.bloodsucker_dead_cond()).toBe(false);

    giveInfoPortion(infoPortions.zat_b57_bloodsucker_lair_clear);

    expect(gameOutroConfig.OUTRO_CONDITIONS.bloodsucker_live_cond()).toBe(false);
    expect(gameOutroConfig.OUTRO_CONDITIONS.bloodsucker_dead_cond()).toBe(true);
  });

  it("should correctly check yanov factions condition", () => {
    expect(gameOutroConfig.OUTRO_CONDITIONS.dolg_die_cond()).toBe(false);
    expect(gameOutroConfig.OUTRO_CONDITIONS.freedom_die_cond()).toBe(false);
    expect(gameOutroConfig.OUTRO_CONDITIONS.dolg_n_freedom_cond()).toBe(true);

    giveInfoPortion(infoPortions.sim_freedom_help_harder);

    expect(gameOutroConfig.OUTRO_CONDITIONS.dolg_die_cond()).toBe(true);
    expect(gameOutroConfig.OUTRO_CONDITIONS.freedom_die_cond()).toBe(false);
    expect(gameOutroConfig.OUTRO_CONDITIONS.dolg_n_freedom_cond()).toBe(false);

    giveInfoPortion(infoPortions.sim_duty_help_harder);

    expect(gameOutroConfig.OUTRO_CONDITIONS.dolg_die_cond()).toBe(true);
    expect(gameOutroConfig.OUTRO_CONDITIONS.freedom_die_cond()).toBe(true);
    expect(gameOutroConfig.OUTRO_CONDITIONS.dolg_n_freedom_cond()).toBe(false);
  });

  it("should correctly check scientist condition", () => {
    expect(gameOutroConfig.OUTRO_CONDITIONS.scientist_good_cond()).toBe(false);
    expect(gameOutroConfig.OUTRO_CONDITIONS.scientist_bad_cond()).toBe(true);

    giveInfoPortion(infoPortions.research_man_gained);

    expect(gameOutroConfig.OUTRO_CONDITIONS.scientist_good_cond()).toBe(true);
    expect(gameOutroConfig.OUTRO_CONDITIONS.scientist_bad_cond()).toBe(false);
  });

  it("should correctly check garik condition", () => {
    expect(gameOutroConfig.OUTRO_CONDITIONS.garik_good_cond()).toBe(false);
    expect(gameOutroConfig.OUTRO_CONDITIONS.garik_bad_cond()).toBe(true);

    giveInfoPortion(infoPortions.pri_a28_army_leaved_alive);

    expect(gameOutroConfig.OUTRO_CONDITIONS.garik_good_cond()).toBe(true);
    expect(gameOutroConfig.OUTRO_CONDITIONS.garik_bad_cond()).toBe(false);
  });

  it("should correctly check oasis condition", () => {
    expect(gameOutroConfig.OUTRO_CONDITIONS.oasis_cond()).toBe(false);

    giveInfoPortion(infoPortions.jup_b16_oasis_artefact_to_scientist);

    expect(gameOutroConfig.OUTRO_CONDITIONS.oasis_cond()).toBe(true);
  });

  it("should correctly check mercs condition", () => {
    expect(gameOutroConfig.OUTRO_CONDITIONS.mercenarys_cond()).toBe(false);

    giveInfoPortion(infoPortions.pri_b35_task_running);

    expect(gameOutroConfig.OUTRO_CONDITIONS.mercenarys_cond()).toBe(true);
  });

  it("should correctly check yanov monsters condition", () => {
    expect(gameOutroConfig.OUTRO_CONDITIONS.yanov_good_cond()).toBe(false);
    expect(gameOutroConfig.OUTRO_CONDITIONS.yanov_bad_cond()).toBe(true);

    giveInfoPortion(infoPortions.mutant_hunter_achievement_gained);

    expect(gameOutroConfig.OUTRO_CONDITIONS.yanov_good_cond()).toBe(true);
    expect(gameOutroConfig.OUTRO_CONDITIONS.yanov_bad_cond()).toBe(false);
  });

  it("should correctly check zulus condition", () => {
    expect(gameOutroConfig.OUTRO_CONDITIONS.zuluz_good_cond()).toBe(false);
    expect(gameOutroConfig.OUTRO_CONDITIONS.zuluz_bad_cond()).toBe(true);

    giveInfoPortion(infoPortions.pri_b301_save_zulus_complete);

    expect(gameOutroConfig.OUTRO_CONDITIONS.zuluz_good_cond()).toBe(true);
    expect(gameOutroConfig.OUTRO_CONDITIONS.zuluz_bad_cond()).toBe(false);
  });

  it("should correctly check vano condition", () => {
    expect(gameOutroConfig.OUTRO_CONDITIONS.vano_good_cond()).toBe(false);
    expect(gameOutroConfig.OUTRO_CONDITIONS.vano_bad_cond()).toBe(false);

    giveInfoPortion(infoPortions.jup_a10_vano_agree_go_und);

    expect(gameOutroConfig.OUTRO_CONDITIONS.vano_good_cond()).toBe(false);
    expect(gameOutroConfig.OUTRO_CONDITIONS.vano_bad_cond()).toBe(true);

    giveInfoPortion(infoPortions.pri_a16_vano_was_alive_when_removed);

    expect(gameOutroConfig.OUTRO_CONDITIONS.vano_good_cond()).toBe(true);
    expect(gameOutroConfig.OUTRO_CONDITIONS.vano_bad_cond()).toBe(false);
  });

  it("should correctly check brodyaga condition", () => {
    expect(gameOutroConfig.OUTRO_CONDITIONS.brodyaga_good_cond()).toBe(false);
    expect(gameOutroConfig.OUTRO_CONDITIONS.brodyaga_bad_cond()).toBe(false);

    giveInfoPortion(infoPortions.jup_b218_monolith_hired);

    expect(gameOutroConfig.OUTRO_CONDITIONS.brodyaga_good_cond()).toBe(false);
    expect(gameOutroConfig.OUTRO_CONDITIONS.brodyaga_bad_cond()).toBe(true);

    giveInfoPortion(infoPortions.pri_a16_wanderer_was_alive_when_removed);

    expect(gameOutroConfig.OUTRO_CONDITIONS.brodyaga_good_cond()).toBe(true);
    expect(gameOutroConfig.OUTRO_CONDITIONS.brodyaga_bad_cond()).toBe(false);
  });

  it("should correctly check sokolov condition", () => {
    expect(gameOutroConfig.OUTRO_CONDITIONS.sokolov_good_cond()).toBe(false);
    expect(gameOutroConfig.OUTRO_CONDITIONS.sokolov_bad_cond()).toBe(false);

    giveInfoPortion(infoPortions.jup_b218_soldier_hired);

    expect(gameOutroConfig.OUTRO_CONDITIONS.sokolov_good_cond()).toBe(false);
    expect(gameOutroConfig.OUTRO_CONDITIONS.sokolov_bad_cond()).toBe(true);

    giveInfoPortion(infoPortions.pri_a28_sokolov_left_alive);

    expect(gameOutroConfig.OUTRO_CONDITIONS.sokolov_good_cond()).toBe(true);
    expect(gameOutroConfig.OUTRO_CONDITIONS.sokolov_bad_cond()).toBe(false);
  });

  it("should correctly check sich condition", () => {
    expect(gameOutroConfig.OUTRO_CONDITIONS.sich_cond()).toBe(false);

    giveInfoPortion(infoPortions.balance_advocate_gained);

    expect(gameOutroConfig.OUTRO_CONDITIONS.sich_cond()).toBe(true);
  });

  it("should correctly check noah condition", () => {
    expect(gameOutroConfig.OUTRO_CONDITIONS.noahs_ark_cond()).toBe(false);

    giveInfoPortion(infoPortions.zat_b18_noah_met);

    expect(gameOutroConfig.OUTRO_CONDITIONS.noahs_ark_cond()).toBe(true);

    giveInfoPortion(infoPortions.zat_b18_noah_dead);

    expect(gameOutroConfig.OUTRO_CONDITIONS.noahs_ark_cond()).toBe(false);
  });

  it("should correctly check kardan condition", () => {
    expect(gameOutroConfig.OUTRO_CONDITIONS.kardan_good_cond()).toBe(false);
    expect(gameOutroConfig.OUTRO_CONDITIONS.kardan_bad_cond()).toBe(true);

    giveInfoPortion(infoPortions.zat_b44_tech_buddies_both_told);

    expect(gameOutroConfig.OUTRO_CONDITIONS.kardan_good_cond()).toBe(true);
    expect(gameOutroConfig.OUTRO_CONDITIONS.kardan_bad_cond()).toBe(false);
  });

  it("should correctly check strelok condition", () => {
    expect(gameOutroConfig.OUTRO_CONDITIONS.strelok_live_cond()).toBe(true);
    expect(gameOutroConfig.OUTRO_CONDITIONS.strelok_die_cond()).toBe(false);

    giveInfoPortion(infoPortions.pri_a28_strelok_dead);

    expect(gameOutroConfig.OUTRO_CONDITIONS.strelok_live_cond()).toBe(false);
    expect(gameOutroConfig.OUTRO_CONDITIONS.strelok_die_cond()).toBe(true);
  });

  it("should correctly check kovalski condition", () => {
    expect(gameOutroConfig.OUTRO_CONDITIONS.kovalski_live_cond()).toBe(true);
    expect(gameOutroConfig.OUTRO_CONDITIONS.kovalski_die_cond()).toBe(false);

    giveInfoPortion(infoPortions.pri_a28_koval_dead);

    expect(gameOutroConfig.OUTRO_CONDITIONS.kovalski_live_cond()).toBe(false);
    expect(gameOutroConfig.OUTRO_CONDITIONS.kovalski_die_cond()).toBe(true);
  });
});
