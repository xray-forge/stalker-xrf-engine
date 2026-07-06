import { describe, expect, it, jest } from "@jest/globals";
import { IniFile } from "xray16/alias";
import { TNumberId } from "xray16/lib";
import { MockIniFile } from "xray16/mocks";

import { EPlayableSound, ESoundPlaylistType } from "@/engine/core/managers/sounds";
import { NpcSound } from "@/engine/core/managers/sounds/objects/NpcSound";

describe("NpcSound", () => {
  it("should fail init on missing data", () => {
    expect(() => new NpcSound(MockIniFile.mock("test.ltx"), "test_npc_sound")).toThrow(
      "Attempt to read a non-existent string field 'path' in section 'test_npc_sound'."
    );
  });

  it("should correctly initialize with minimal data", () => {
    const ini: IniFile = MockIniFile.mock("test.ltx", {
      test_npc_sound: {
        path: "some/sound/path.ogg",
      },
    });
    const sound: NpcSound = new NpcSound(ini, "test_npc_sound");

    expect(sound.type).toBe(EPlayableSound.NPC);
    expect(sound.section).toBe("test_npc_sound");
    expect(sound.path).toBe("some/sound/path.ogg");
    expect(sound.prefix).toBe(false);
    expect(sound.isCombatSound).toBe(false);
    expect(sound.isGroupSound).toBe(false);
    expect(sound.canPlaySound).toEqualLuaTables({});
    expect(sound.objects).toEqualLuaTables({});
    expect(sound.availableCommunities).toEqualLuaTables({
      army: true,
      bandit: true,
      dolg: true,
      ecolog: true,
      freedom: true,
      killer: true,
      monolith: true,
      stalker: true,
      zombied: true,
    });
    expect(sound.soundPaths).toEqualLuaTables({});
    expect(sound.shuffle).toBe(ESoundPlaylistType.RANDOM);
    expect(sound.faction).toBe("");
    expect(sound.point).toBe("");
    expect(sound.message).toBe("");
    expect(sound.canPlayGroupSound).toBe(true);
    expect(sound.pdaSoundObject).toBeNull();
    expect(sound.playedSoundIndex).toBeNull();
    expect(sound.playingStartedAt).toBeNull();
    expect(sound.idleTime).toBeNull();
    expect(sound.minIdle).toBe(3);
    expect(sound.maxIdle).toBe(5);
    expect(sound.random).toBe(100);
    expect(sound.delay).toBe(0);
  });

  it("should correctly initialize object with provided ini fields", () => {
    const ini: IniFile = MockIniFile.mock("test.ltx", {
      pri_a15_army_hide_weapon: {
        type: "npc",
        path: "scenario\\pripyat\\pri_a15_army_hide_weapon",
        shuffle: "seq",
        faction: "army",
        point: "test_point",
        message: "test_message",
        idle: "0,45,525",
        delay_sound: 400,
        npc_prefix: true,
        group_snd: true,
        avail_communities: "army, dolg",
        is_combat_sound: true,
        play_always: true,
      },
    });
    const sound: NpcSound = new NpcSound(ini, "pri_a15_army_hide_weapon");

    expect(sound.type).toBe(EPlayableSound.NPC);
    expect(sound.section).toBe("pri_a15_army_hide_weapon");
    expect(sound.path).toBe("scenario\\pripyat\\pri_a15_army_hide_weapon");
    expect(sound.prefix).toBe(true);
    expect(sound.isCombatSound).toBe(true);
    expect(sound.isGroupSound).toBe(true);
    expect(sound.canPlaySound).toEqualLuaTables({});
    expect(sound.objects).toEqualLuaTables({});
    expect(sound.availableCommunities).toEqualLuaTables({
      army: true,
      dolg: true,
    });
    expect(sound.soundPaths).toEqualLuaTables({});
    expect(sound.shuffle).toBe(ESoundPlaylistType.SEQUENCE);
    expect(sound.faction).toBe("army");
    expect(sound.point).toBe("test_point");
    expect(sound.message).toBe("test_message");
    expect(sound.canPlayGroupSound).toBe(true);
    expect(sound.pdaSoundObject).toBeNull();
    expect(sound.playedSoundIndex).toBeNull();
    expect(sound.playingStartedAt).toBeNull();
    expect(sound.idleTime).toBeNull();
    expect(sound.minIdle).toBe(0);
    expect(sound.maxIdle).toBe(45);
    expect(sound.random).toBe(525);
    expect(sound.delay).toBe(400);
  });

  it("should correctly select next random sound excluding the previously played index", () => {
    const ini: IniFile = MockIniFile.mock("test.ltx", { test_npc_sound: { path: "some/path" } });
    const sound: NpcSound = new NpcSound(ini, "test_npc_sound");
    const objectId: TNumberId = 10;

    sound.objects.set(objectId, { id: objectId, max: 5 });

    const randomSpy = jest.spyOn(math, "random");

    // First play (no previous index): uniform over the full inclusive range 0..max.
    sound.playedSoundIndex = null;
    randomSpy.mockReturnValueOnce(4);
    expect(sound.selectNextSound(objectId)).toBe(4);

    sound.playedSoundIndex = 2;

    randomSpy.mockReturnValueOnce(0);
    expect(sound.selectNextSound(objectId)).toBe(0); // 0 < 2 -> unchanged

    randomSpy.mockReturnValueOnce(2);
    expect(sound.selectNextSound(objectId)).toBe(3); // draw == previous -> shifted up (never repeats)

    randomSpy.mockReturnValueOnce(3);
    expect(sound.selectNextSound(objectId)).toBe(4);

    randomSpy.mockReturnValueOnce(4);
    expect(sound.selectNextSound(objectId)).toBe(5);

    randomSpy.mockRestore();
  });

  it.todo("should correctly handle sound play end");

  it.todo("should correctly play/stop");

  it.todo("should correctly reset");

  it.todo("should correctly save/load");
});
