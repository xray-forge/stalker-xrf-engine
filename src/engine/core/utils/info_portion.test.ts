import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";

import { registry } from "@/engine/core/database";
import {
  disableInfoPortion,
  giveInfoPortion,
  hasAtLeastOneInfoPortion,
  hasFewInfoPortions,
  hasInfoPortion,
  hasInfoPortions,
} from "@/engine/core/utils/info_portion";
import { infoPortions, TInfoPortion } from "@/engine/lib/constants/info_portions";
import { GameObject } from "@/engine/lib/types";
import { MockGameObject } from "@/fixtures/xray";

describe("info_portion utils", () => {
  beforeEach(() => {
    let availableInfos: Array<TInfoPortion> = [
      infoPortions.info_up_ac_mp5,
      infoPortions.pri_a15_lights_off,
      infoPortions.device_pda_port_bandit_leader_sold,
    ];

    registry.actor = MockGameObject.mock({
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
    registry.actor = null as unknown as GameObject;
  });

  it("giveInfoPortion should correctly give info portion for actor", () => {
    registry.actor = MockGameObject.mockActor();

    giveInfoPortion(infoPortions.info_up_ac_mp5);

    expect(registry.actor.give_info_portion).toHaveBeenCalledWith(infoPortions.info_up_ac_mp5);
    expect(registry.actor.give_info_portion).toHaveBeenCalledTimes(1);
  });

  it("hasInfoPortion should correctly check info", () => {
    expect(hasInfoPortion(infoPortions.info_up_ac_mp5)).toBe(true);
    expect(hasInfoPortion(infoPortions.pri_a15_lights_off)).toBe(true);
    expect(hasInfoPortion(infoPortions.zat_a2_linker_b14_quest_strange_item_lost_artefact)).toBe(false);
    expect(hasInfoPortion(infoPortions.pri_a17_actor_attack_military_antibug)).toBe(false);

    expect(registry.actor.has_info).toHaveBeenCalledTimes(4);
  });

  it("disableInfoPortion should correctly turn off info", () => {
    expect(registry.actor.disable_info_portion).toHaveBeenCalledTimes(0);

    expect(hasInfoPortion(infoPortions.info_up_ac_mp5)).toBe(true);
    disableInfoPortion(infoPortions.info_up_ac_mp5);
    expect(hasInfoPortion(infoPortions.info_up_ac_mp5)).toBe(false);

    expect(registry.actor.disable_info_portion).toHaveBeenCalledTimes(1);
    expect(registry.actor.has_info).toHaveBeenCalledTimes(3);
  });

  it("hasInfoPortions should correctly check whole list of info portions", () => {
    expect(hasInfoPortions([infoPortions.info_up_ac_mp5])).toBe(true);
    expect(hasInfoPortions([infoPortions.info_up_ac_mp5, infoPortions.pri_a15_lights_off])).toBe(true);
    expect(hasInfoPortions([infoPortions.info_up_ac_mp5, infoPortions.device_pda_port_bandit_leader_sold])).toBe(true);
    expect(hasInfoPortions([infoPortions.pri_a15_lights_off, infoPortions.device_pda_port_bandit_leader_sold])).toBe(
      true
    );

    expect(hasInfoPortions([])).toBe(false);
    expect(hasInfoPortions([infoPortions.info_up_fh_scientific_outfit])).toBe(false);
    expect(hasInfoPortions([infoPortions.info_up_ac_mp5, infoPortions.info_up_fh_scientific_outfit])).toBe(false);
    expect(hasInfoPortions([infoPortions.pri_a15_lights_off, infoPortions.info_up_fh_scientific_outfit])).toBe(false);
  });

  it("hasAtLeastOneInfoPortion should correctly check one of list", () => {
    expect(hasAtLeastOneInfoPortion([infoPortions.info_up_ac_mp5])).toBe(true);
    expect(hasAtLeastOneInfoPortion([infoPortions.info_up_ac_mp5, infoPortions.pri_a15_lights_off])).toBe(true);
    expect(hasAtLeastOneInfoPortion([])).toBe(false);
    expect(hasAtLeastOneInfoPortion([infoPortions.info_up_fh_scientific_outfit])).toBe(false);
    expect(hasAtLeastOneInfoPortion([infoPortions.info_up_ac_mp5, infoPortions.info_up_fh_scientific_outfit])).toBe(
      true
    );
    expect(hasAtLeastOneInfoPortion([infoPortions.pri_a15_lights_off, infoPortions.info_up_fh_scientific_outfit])).toBe(
      true
    );
  });

  it("hasFewInfoPortions should correctly check one of list", () => {
    expect(hasFewInfoPortions([infoPortions.info_up_ac_mp5], 1)).toBe(true);
    expect(hasFewInfoPortions([infoPortions.info_up_ac_mp5], 2)).toBe(false);
    expect(hasFewInfoPortions([infoPortions.info_up_ac_mp5, infoPortions.pri_a15_lights_off], 1)).toBe(true);
    expect(hasFewInfoPortions([infoPortions.info_up_ac_mp5, infoPortions.pri_a15_lights_off], 2)).toBe(true);
    expect(hasFewInfoPortions([infoPortions.info_up_ac_mp5, infoPortions.pri_a15_lights_off], 3)).toBe(false);
    expect(hasFewInfoPortions([], 0)).toBe(false);
    expect(hasFewInfoPortions([], 1)).toBe(false);
    expect(hasFewInfoPortions([infoPortions.info_up_fh_scientific_outfit], 1)).toBe(false);
    expect(hasFewInfoPortions([infoPortions.info_up_fh_scientific_outfit], 2)).toBe(false);
    expect(hasFewInfoPortions([infoPortions.info_up_ac_mp5, infoPortions.info_up_fh_scientific_outfit], 1)).toBe(true);
    expect(
      hasFewInfoPortions(
        [infoPortions.info_up_ac_mp5, infoPortions.pri_a15_lights_off, infoPortions.info_up_fh_scientific_outfit],
        1
      )
    ).toBe(true);
    expect(
      hasFewInfoPortions(
        [infoPortions.info_up_ac_mp5, infoPortions.pri_a15_lights_off, infoPortions.info_up_fh_scientific_outfit],
        2
      )
    ).toBe(true);
    expect(
      hasFewInfoPortions(
        [infoPortions.info_up_ac_mp5, infoPortions.pri_a15_lights_off, infoPortions.info_up_fh_scientific_outfit],
        3
      )
    ).toBe(false);
  });
});
