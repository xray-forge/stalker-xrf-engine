import { describe, expect, it, jest } from "@jest/globals";
import { clsid } from "xray16";

import { NpcSound } from "@/engine/core/managers/sounds/objects";
import { soundsConfig } from "@/engine/core/managers/sounds/SoundsConfig";
import { initializeObjectThemes } from "@/engine/core/managers/sounds/utils/sounds_play";
import { ClientObject } from "@/engine/lib/types";
import { mockClientGameObject } from "@/fixtures/xray";

describe("sounds_play utils", () => {
  it("initializeObjectThemes should correctly initialize object community themes", () => {
    const attackBegin: NpcSound = soundsConfig.themes.get("attack_begin") as NpcSound;
    const attackBeginReply: NpcSound = soundsConfig.themes.get("attack_begin_reply") as NpcSound;

    jest.spyOn(attackBegin, "initializeObject").mockImplementation(jest.fn());
    jest.spyOn(attackBeginReply, "initializeObject").mockImplementation(jest.fn());

    const dolgObject: ClientObject = mockClientGameObject({
      character_community: <T>() => "dolg" as T,
      clsid: () => clsid.script_stalker,
    });

    initializeObjectThemes(dolgObject);

    expect(attackBegin.initializeObject).toHaveBeenCalledWith(dolgObject);
    expect(attackBeginReply.initializeObject).not.toHaveBeenCalled();

    const object: ClientObject = mockClientGameObject({
      clsid: () => clsid.script_stalker,
    });

    initializeObjectThemes(object);

    expect(attackBegin.initializeObject).toHaveBeenCalledWith(object);
    expect(attackBeginReply.initializeObject).toHaveBeenCalledWith(object);
  });
});
