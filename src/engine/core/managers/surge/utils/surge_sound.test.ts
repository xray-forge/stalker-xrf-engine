import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { level } from "xray16";

import { registry } from "@/engine/core/database";
import { GlobalSoundManager } from "@/engine/core/managers/sounds";
import {
  playSurgeEndedSound,
  playSurgeStartingSound,
  playSurgeWillHappenSoonSound,
} from "@/engine/core/managers/surge/utils/surge_sound";
import { giveInfoPortion } from "@/engine/core/utils/info_portion";
import { ACTOR_ID } from "@/engine/lib/constants/ids";
import { infoPortions } from "@/engine/lib/constants/info_portions";
import { mockRegisteredActor } from "@/fixtures/engine";

describe("surge_sound utils", () => {
  beforeEach(() => {
    registry.managers = new LuaTable();
    mockRegisteredActor();
  });

  it("playSurgeStartingSound should correctly play sound", () => {
    const manager: GlobalSoundManager = GlobalSoundManager.getInstance();

    jest.spyOn(manager, "playSound").mockImplementation(() => null);

    jest.spyOn(level, "name").mockImplementation(() => "zaton");
    playSurgeStartingSound();
    expect(manager.playSound).toHaveBeenCalledWith(ACTOR_ID, "zat_a2_stalker_barmen_surge_phase_1");

    jest.spyOn(level, "name").mockImplementation(() => "jupiter");
    playSurgeStartingSound();
    expect(manager.playSound).toHaveBeenCalledWith(ACTOR_ID, "jup_a6_stalker_medik_phase_1");

    jest.spyOn(level, "name").mockImplementation(() => "pripyat");
    playSurgeStartingSound();
    expect(manager.playSound).toHaveBeenCalledWith(ACTOR_ID, "pri_a17_kovalsky_surge_phase_1");

    giveInfoPortion(infoPortions.pri_b305_fifth_cam_end);
    playSurgeStartingSound();
    expect(manager.playSound).toHaveBeenCalledTimes(3);
  });

  it("playSurgeWillHappenSoonSound should correctly play sound", () => {
    const manager: GlobalSoundManager = GlobalSoundManager.getInstance();

    jest.spyOn(manager, "playSound").mockImplementation(() => null);

    jest.spyOn(level, "name").mockImplementation(() => "zaton");
    playSurgeWillHappenSoonSound();
    expect(manager.playSound).toHaveBeenCalledWith(ACTOR_ID, "zat_a2_stalker_barmen_surge_phase_2");

    jest.spyOn(level, "name").mockImplementation(() => "jupiter");
    playSurgeWillHappenSoonSound();
    expect(manager.playSound).toHaveBeenCalledWith(ACTOR_ID, "jup_a6_stalker_medik_phase_2");

    jest.spyOn(level, "name").mockImplementation(() => "pripyat");
    playSurgeWillHappenSoonSound();
    expect(manager.playSound).toHaveBeenCalledWith(ACTOR_ID, "pri_a17_kovalsky_surge_phase_2");

    giveInfoPortion(infoPortions.pri_b305_fifth_cam_end);
    playSurgeWillHappenSoonSound();
    expect(manager.playSound).toHaveBeenCalledTimes(3);
  });

  it("playSurgeEndedSound should correctly play sound", () => {
    const manager: GlobalSoundManager = GlobalSoundManager.getInstance();

    jest.spyOn(manager, "playSound").mockImplementation(() => null);

    jest.spyOn(level, "name").mockImplementation(() => "zaton");
    playSurgeEndedSound();
    expect(manager.playSound).toHaveBeenCalledWith(ACTOR_ID, "zat_a2_stalker_barmen_after_surge");

    jest.spyOn(level, "name").mockImplementation(() => "jupiter");
    playSurgeEndedSound();
    expect(manager.playSound).toHaveBeenCalledWith(ACTOR_ID, "jup_a6_stalker_medik_after_surge");

    jest.spyOn(level, "name").mockImplementation(() => "pripyat");
    playSurgeEndedSound();
    expect(manager.playSound).toHaveBeenCalledWith(ACTOR_ID, "pri_a17_kovalsky_after_surge");

    giveInfoPortion(infoPortions.pri_b305_fifth_cam_end);
    playSurgeEndedSound();
    expect(manager.playSound).toHaveBeenCalledTimes(3);
  });
});
