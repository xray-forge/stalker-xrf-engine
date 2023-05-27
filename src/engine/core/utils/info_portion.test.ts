import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";

import { registry } from "@/engine/core/database";
import {
  disableInfo,
  giveInfo,
  hasAlifeInfo,
  hasAlifeInfos,
  hasAtLeastOneAlifeInfo,
  hasFewAlifeInfos,
} from "@/engine/core/utils/info_portion";
import { infoPortions, TInfoPortion } from "@/engine/lib/constants/info_portions/info_portions";
import { ClientObject } from "@/engine/lib/types";
import { mockClientGameObject } from "@/fixtures/xray";

describe("'info_portion' utils", () => {
  beforeEach(() => {
    let availableInfos: Array<TInfoPortion> = [
      infoPortions.info_up_ac_mp5,
      infoPortions.pri_a15_lights_off,
      infoPortions.device_pda_port_bandit_leader_sold,
    ];

    registry.actor = mockClientGameObject({
      has_info: jest.fn((value: TInfoPortion) => availableInfos.includes(value)),
      give_info_portion: jest.fn((value: TInfoPortion) => {
        availableInfos.push(value);

        return true;
      }),
      disable_info_portion: jest.fn((value: TInfoPortion) => {
        availableInfos = availableInfos.filter((it) => it !== value);

        return true;
      }),
    });
  });

  afterEach(() => {
    registry.actor = null as unknown as ClientObject;
  });

  it("'giveInfo' should correctly give info portion for actor", () => {
    registry.actor = mockClientGameObject();

    giveInfo(infoPortions.info_up_ac_mp5);

    expect(registry.actor.give_info_portion).toHaveBeenCalledWith(infoPortions.info_up_ac_mp5);
    expect(registry.actor.give_info_portion).toHaveBeenCalledTimes(1);
  });

  it("'giveInfo' should correctly ignore invalid info portions", () => {
    registry.actor = mockClientGameObject();

    giveInfo(null);
    giveInfo(undefined);
    giveInfo();

    expect(registry.actor.give_info_portion).toHaveBeenCalledTimes(0);
  });

  it("'hasAlifeInfo' should correctly check info", () => {
    expect(hasAlifeInfo(infoPortions.info_up_ac_mp5)).toBe(true);
    expect(hasAlifeInfo(infoPortions.pri_a15_lights_off)).toBe(true);
    expect(hasAlifeInfo(infoPortions.zat_a2_linker_b14_quest_strange_item_lost_artefact)).toBe(false);
    expect(hasAlifeInfo(infoPortions.pri_a17_actor_attack_military_antibug)).toBe(false);

    expect(registry.actor.has_info).toHaveBeenCalledTimes(4);
  });

  it("'disableInfo' should correctly turn off info", () => {
    disableInfo(null);
    disableInfo();

    expect(registry.actor.disable_info_portion).toHaveBeenCalledTimes(0);

    expect(hasAlifeInfo(infoPortions.info_up_ac_mp5)).toBe(true);
    disableInfo(infoPortions.info_up_ac_mp5);
    expect(hasAlifeInfo(infoPortions.info_up_ac_mp5)).toBe(false);

    expect(registry.actor.disable_info_portion).toHaveBeenCalledTimes(1);
    expect(registry.actor.has_info).toHaveBeenCalledTimes(3);
  });

  it("'hasAlifeInfos' should correctly check whole list of info portions", () => {
    expect(hasAlifeInfos([infoPortions.info_up_ac_mp5])).toBe(true);
    expect(hasAlifeInfos([infoPortions.info_up_ac_mp5, infoPortions.pri_a15_lights_off])).toBe(true);
    expect(hasAlifeInfos([infoPortions.info_up_ac_mp5, infoPortions.device_pda_port_bandit_leader_sold])).toBe(true);
    expect(hasAlifeInfos([infoPortions.pri_a15_lights_off, infoPortions.device_pda_port_bandit_leader_sold])).toBe(
      true
    );

    expect(hasAlifeInfos([])).toBe(false);
    expect(hasAlifeInfos([infoPortions.info_up_fh_scientific_outfit])).toBe(false);
    expect(hasAlifeInfos([infoPortions.info_up_ac_mp5, infoPortions.info_up_fh_scientific_outfit])).toBe(false);
    expect(hasAlifeInfos([infoPortions.pri_a15_lights_off, infoPortions.info_up_fh_scientific_outfit])).toBe(false);
  });

  it("'hasAtLeastOneAlifeInfo' should correctly check one of list", () => {
    expect(hasAtLeastOneAlifeInfo([infoPortions.info_up_ac_mp5])).toBe(true);
    expect(hasAtLeastOneAlifeInfo([infoPortions.info_up_ac_mp5, infoPortions.pri_a15_lights_off])).toBe(true);
    expect(hasAtLeastOneAlifeInfo([])).toBe(false);
    expect(hasAtLeastOneAlifeInfo([infoPortions.info_up_fh_scientific_outfit])).toBe(false);
    expect(hasAtLeastOneAlifeInfo([infoPortions.info_up_ac_mp5, infoPortions.info_up_fh_scientific_outfit])).toBe(true);
    expect(hasAtLeastOneAlifeInfo([infoPortions.pri_a15_lights_off, infoPortions.info_up_fh_scientific_outfit])).toBe(
      true
    );
  });

  it("'hasAtLeastOneAlifeInfo' should correctly check one of list", () => {
    expect(hasFewAlifeInfos([infoPortions.info_up_ac_mp5], 1)).toBe(true);
    expect(hasFewAlifeInfos([infoPortions.info_up_ac_mp5], 2)).toBe(false);
    expect(hasFewAlifeInfos([infoPortions.info_up_ac_mp5, infoPortions.pri_a15_lights_off], 1)).toBe(true);
    expect(hasFewAlifeInfos([infoPortions.info_up_ac_mp5, infoPortions.pri_a15_lights_off], 2)).toBe(true);
    expect(hasFewAlifeInfos([infoPortions.info_up_ac_mp5, infoPortions.pri_a15_lights_off], 3)).toBe(false);
    expect(hasFewAlifeInfos([], 0)).toBe(false);
    expect(hasFewAlifeInfos([], 1)).toBe(false);
    expect(hasFewAlifeInfos([infoPortions.info_up_fh_scientific_outfit], 1)).toBe(false);
    expect(hasFewAlifeInfos([infoPortions.info_up_fh_scientific_outfit], 2)).toBe(false);
    expect(hasFewAlifeInfos([infoPortions.info_up_ac_mp5, infoPortions.info_up_fh_scientific_outfit], 1)).toBe(true);
    expect(
      hasFewAlifeInfos(
        [infoPortions.info_up_ac_mp5, infoPortions.pri_a15_lights_off, infoPortions.info_up_fh_scientific_outfit],
        1
      )
    ).toBe(true);
    expect(
      hasFewAlifeInfos(
        [infoPortions.info_up_ac_mp5, infoPortions.pri_a15_lights_off, infoPortions.info_up_fh_scientific_outfit],
        2
      )
    ).toBe(true);
    expect(
      hasFewAlifeInfos(
        [infoPortions.info_up_ac_mp5, infoPortions.pri_a15_lights_off, infoPortions.info_up_fh_scientific_outfit],
        3
      )
    ).toBe(false);
  });
});
