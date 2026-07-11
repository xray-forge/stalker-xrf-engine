import { beforeEach, describe, expect, it } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { NpcSound } from "@/engine/core/managers/sounds/objects";
import { SCRIPT_SOUND_LTX, soundsConfig } from "@/engine/core/managers/sounds/SoundsConfig";
import { readIniThemesList } from "@/engine/core/managers/sounds/utils/sounds_init";
import { invalidateObjectThemes } from "@/engine/core/managers/sounds/utils/sounds_play";
import { resetRegistry } from "@/fixtures/engine";

describe("invalidateObjectThemes", () => {
  beforeEach(() => {
    resetRegistry();

    soundsConfig.playing = new LuaTable();
    soundsConfig.themes = readIniThemesList(SCRIPT_SOUND_LTX);
  });

  it("should forget NPC theme registrations for the object while keeping play availability", () => {
    const object: GameObject = MockGameObject.mockStalker();
    const another: GameObject = MockGameObject.mockStalker();
    const attackBegin: NpcSound = soundsConfig.themes.get("attack_begin") as NpcSound;

    attackBegin.objects.set(object.id(), { id: 100, max: 1 });
    attackBegin.soundPaths.set(object.id(), new LuaTable());
    attackBegin.canPlaySound.set(object.id(), false);

    attackBegin.objects.set(another.id(), { id: 101, max: 1 });

    invalidateObjectThemes(object.id());

    expect(attackBegin.objects.has(object.id())).toBe(false);
    expect(attackBegin.soundPaths.has(object.id())).toBe(false);
    expect(attackBegin.canPlaySound.get(object.id())).toBe(false);
    expect(attackBegin.objects.has(another.id())).toBe(true);
  });
});
