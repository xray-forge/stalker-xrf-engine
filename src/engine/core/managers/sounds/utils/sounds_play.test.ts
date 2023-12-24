import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { clsid } from "xray16";

import { NpcSound } from "@/engine/core/managers/sounds/objects";
import { SCRIPT_SOUND_LTX, soundsConfig } from "@/engine/core/managers/sounds/SoundsConfig";
import { readIniThemesList } from "@/engine/core/managers/sounds/utils/sounds_init";
import { initializeObjectThemes } from "@/engine/core/managers/sounds/utils/sounds_play";
import { GameObject } from "@/engine/lib/types";
import { resetRegistry } from "@/fixtures/engine";
import { MockGameObject } from "@/fixtures/xray";

describe("sounds_play utils", () => {
  beforeEach(() => {
    resetRegistry();

    soundsConfig.playing = new LuaTable();
    soundsConfig.themes = readIniThemesList(SCRIPT_SOUND_LTX);
  });

  it("initializeObjectThemes should correctly initialize object community themes", () => {
    const attackBegin: NpcSound = soundsConfig.themes.get("attack_begin") as NpcSound;
    const attackBeginReply: NpcSound = soundsConfig.themes.get("attack_begin_reply") as NpcSound;

    for (const [, it] of soundsConfig.themes) {
      if (it instanceof NpcSound) {
        jest.spyOn(it, "initializeObject").mockImplementation(jest.fn());
      }
    }

    const dolgObject: GameObject = MockGameObject.mock({
      character_community: <T>() => "dolg" as T,
      clsid: () => clsid.script_stalker,
    });

    initializeObjectThemes(dolgObject);

    expect(attackBegin.initializeObject).toHaveBeenCalledWith(dolgObject);
    expect(attackBeginReply.initializeObject).not.toHaveBeenCalled();

    const object: GameObject = MockGameObject.mock({
      clsid: () => clsid.script_stalker,
    });

    initializeObjectThemes(object);

    expect(attackBegin.initializeObject).toHaveBeenCalledWith(object);
    expect(attackBeginReply.initializeObject).toHaveBeenCalledWith(object);
  });
});
