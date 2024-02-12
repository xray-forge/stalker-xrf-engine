import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { level } from "xray16";

import { getManager } from "@/engine/core/database";
import { SoundManager } from "@/engine/core/managers/sounds";
import {
  playSurgeEndedSound,
  playSurgeStartingSound,
  playSurgeWillHappenSoonSound,
} from "@/engine/core/managers/surge/utils/surge_sound";
import { giveInfoPortion } from "@/engine/core/utils/info_portion";
import { ACTOR_ID } from "@/engine/lib/constants/ids";
import { infoPortions } from "@/engine/lib/constants/info_portions";
import { mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

describe("playSurgeStartingSound util", () => {
  beforeEach(() => {
    resetRegistry();
    mockRegisteredActor();
  });

  it("should correctly play sound", () => {
    const manager: SoundManager = getManager(SoundManager);

    jest.spyOn(manager, "play").mockImplementation(() => null);

    jest.spyOn(level, "name").mockImplementation(() => "zaton");
    playSurgeStartingSound();
    expect(manager.play).toHaveBeenCalledWith(ACTOR_ID, "zat_a2_stalker_barmen_surge_phase_1");

    jest.spyOn(level, "name").mockImplementation(() => "jupiter");
    playSurgeStartingSound();
    expect(manager.play).toHaveBeenCalledWith(ACTOR_ID, "jup_a6_stalker_medik_phase_1");

    jest.spyOn(level, "name").mockImplementation(() => "pripyat");
    playSurgeStartingSound();
    expect(manager.play).toHaveBeenCalledWith(ACTOR_ID, "pri_a17_kovalsky_surge_phase_1");

    giveInfoPortion(infoPortions.pri_b305_fifth_cam_end);
    playSurgeStartingSound();
    expect(manager.play).toHaveBeenCalledTimes(3);
  });
});

describe("playSurgeWillHappenSoonSound util", () => {
  beforeEach(() => {
    resetRegistry();
    mockRegisteredActor();
  });

  it("should correctly play sound", () => {
    const manager: SoundManager = getManager(SoundManager);

    jest.spyOn(manager, "play").mockImplementation(() => null);

    jest.spyOn(level, "name").mockImplementation(() => "zaton");
    playSurgeWillHappenSoonSound();
    expect(manager.play).toHaveBeenCalledWith(ACTOR_ID, "zat_a2_stalker_barmen_surge_phase_2");

    jest.spyOn(level, "name").mockImplementation(() => "jupiter");
    playSurgeWillHappenSoonSound();
    expect(manager.play).toHaveBeenCalledWith(ACTOR_ID, "jup_a6_stalker_medik_phase_2");

    jest.spyOn(level, "name").mockImplementation(() => "pripyat");
    playSurgeWillHappenSoonSound();
    expect(manager.play).toHaveBeenCalledWith(ACTOR_ID, "pri_a17_kovalsky_surge_phase_2");

    giveInfoPortion(infoPortions.pri_b305_fifth_cam_end);
    playSurgeWillHappenSoonSound();
    expect(manager.play).toHaveBeenCalledTimes(3);
  });
});

describe("playSurgeEndedSound util", () => {
  beforeEach(() => {
    resetRegistry();
    mockRegisteredActor();
  });

  it("should correctly play sound", () => {
    const manager: SoundManager = getManager(SoundManager);

    jest.spyOn(manager, "play").mockImplementation(() => null);

    jest.spyOn(level, "name").mockImplementation(() => "zaton");
    playSurgeEndedSound();
    expect(manager.play).toHaveBeenCalledWith(ACTOR_ID, "zat_a2_stalker_barmen_after_surge");

    jest.spyOn(level, "name").mockImplementation(() => "jupiter");
    playSurgeEndedSound();
    expect(manager.play).toHaveBeenCalledWith(ACTOR_ID, "jup_a6_stalker_medik_after_surge");

    jest.spyOn(level, "name").mockImplementation(() => "pripyat");
    playSurgeEndedSound();
    expect(manager.play).toHaveBeenCalledWith(ACTOR_ID, "pri_a17_kovalsky_after_surge");

    giveInfoPortion(infoPortions.pri_b305_fifth_cam_end);
    playSurgeEndedSound();
    expect(manager.play).toHaveBeenCalledTimes(3);
  });
});
