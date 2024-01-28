import { describe, expect, it } from "@jest/globals";

import { EPlayableSound } from "@/engine/core/managers/sounds";
import { ActorSound, LoopedSound, NpcSound, ObjectSound } from "@/engine/core/managers/sounds/objects";
import { readIniThemesList } from "@/engine/core/managers/sounds/utils/sounds_init";
import { IniFile } from "@/engine/lib/types";
import { MockIniFile } from "@/fixtures/xray";

describe("sounds_init utils", () => {
  it("readIniThemesList should correctly init list of themes", () => {
    expect(() => readIniThemesList(MockIniFile.mock("test.ltx", {}))).toThrow(
      "There is no section 'list' in provided ini file."
    );
    expect(() => {
      readIniThemesList(
        MockIniFile.mock("test.ltx", {
          list: {
            example: 1,
          },
          example: {},
        })
      );
    }).toThrow("Attempt to read a non-existent string field 'type' in section 'example'.");

    expect(readIniThemesList(MockIniFile.mock("test.ltx", { list: {} }))).toEqualLuaTables({});

    const ini: IniFile = MockIniFile.mock("test.ltx", {
      list: ["first", "second", "third", "fourth"],
      first: {
        type: EPlayableSound.NPC,
        path: "first.ogg",
      },
      second: {
        type: EPlayableSound.ACTOR,
        path: "second.ogg",
      },
      third: {
        type: EPlayableSound["3D"],
        path: "third.ogg",
      },
      fourth: {
        type: EPlayableSound.LOOPED,
        path: "fourth.ogg",
      },
    });

    expect(readIniThemesList(ini)).toEqualLuaTables({
      first: new NpcSound(ini, "first"),
      second: new ActorSound(ini, "second"),
      third: new ObjectSound(ini, "third"),
      fourth: new LoopedSound(ini, "fourth"),
    });
  });
});
