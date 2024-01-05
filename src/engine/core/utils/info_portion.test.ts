import { beforeEach, describe, expect, it } from "@jest/globals";

import { registry } from "@/engine/core/database";
import {
  disableInfoPortion,
  giveInfoPortion,
  hasAtLeastOneInfoPortion,
  hasFewInfoPortions,
  hasInfoPortion,
  hasInfoPortions,
} from "@/engine/core/utils/info_portion";
import { infoPortions } from "@/engine/lib/constants/info_portions";
import { mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

describe("giveInfoPortion util", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should correctly give info portion for actor", () => {
    mockRegisteredActor();

    giveInfoPortion(infoPortions.info_up_ac_mp5);

    expect(registry.actor.give_info_portion).toHaveBeenCalledWith(infoPortions.info_up_ac_mp5);
    expect(registry.actor.give_info_portion).toHaveBeenCalledTimes(1);
  });
});

describe("disableInfoPortion utils", () => {
  beforeEach(() => {
    mockRegisteredActor();

    [
      infoPortions.info_up_ac_mp5,
      infoPortions.pri_a15_lights_off,
      infoPortions.device_pda_port_bandit_leader_sold,
    ].forEach((it) => giveInfoPortion(it));
  });

  it("should correctly turn off info", () => {
    expect(registry.actor.disable_info_portion).toHaveBeenCalledTimes(0);

    expect(hasInfoPortion(infoPortions.info_up_ac_mp5)).toBe(true);
    disableInfoPortion(infoPortions.info_up_ac_mp5);
    expect(hasInfoPortion(infoPortions.info_up_ac_mp5)).toBe(false);

    expect(registry.actor.disable_info_portion).toHaveBeenCalledTimes(1);
    expect(registry.actor.has_info).toHaveBeenCalledTimes(3);
  });
});

describe("info_portion utils", () => {
  beforeEach(() => {
    mockRegisteredActor();

    [
      infoPortions.info_up_ac_mp5,
      infoPortions.pri_a15_lights_off,
      infoPortions.device_pda_port_bandit_leader_sold,
    ].forEach((it) => giveInfoPortion(it));
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
});

describe("hasAtLeastOneInfoPortion util", () => {
  beforeEach(() => {
    mockRegisteredActor();

    [
      infoPortions.info_up_ac_mp5,
      infoPortions.pri_a15_lights_off,
      infoPortions.device_pda_port_bandit_leader_sold,
    ].forEach((it) => giveInfoPortion(it));
  });

  it("should correctly check one of list", () => {
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
});

describe("hasFewInfoPortions util", () => {
  beforeEach(() => {
    mockRegisteredActor();

    [
      infoPortions.info_up_ac_mp5,
      infoPortions.pri_a15_lights_off,
      infoPortions.device_pda_port_bandit_leader_sold,
    ].forEach((it) => giveInfoPortion(it));
  });

  it("should correctly check one of list", () => {
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
