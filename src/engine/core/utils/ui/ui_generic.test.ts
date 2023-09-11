import { describe, expect, it, jest } from "@jest/globals";
import { CScriptXmlInit, get_hud, level } from "xray16";

import { registerActor, registry } from "@/engine/core/database";
import { isWideScreen, resolveXmlFile, resolveXmlFormPath, setUiVisibility } from "@/engine/core/utils/ui/ui_generic";
import { roots } from "@/engine/lib/constants/roots";
import { GameHud } from "@/engine/lib/types";
import { mockActorClientGameObject, MockDevice } from "@/fixtures/xray";
import { MockFileSystem } from "@/fixtures/xray/mocks/fs/FileSystem.mock";

describe("'ui' utils", () => {
  it("'isWideScreen' should correctly check whether game is in wide screen mode", () => {
    expect(isWideScreen()).toBe(true);

    const device: MockDevice = MockDevice.getInstance();

    device.width = 1024;
    device.height = 768;

    expect(isWideScreen()).toBe(false);

    device.width = 640;
    device.height = 480;

    expect(isWideScreen()).toBe(false);

    device.width = 2048;
    device.height = 1536;

    expect(isWideScreen()).toBe(false);

    device.width = 1024;
    device.height = 540;

    expect(isWideScreen()).toBe(true);

    device.width = 2560;
    device.height = 1440;

    expect(isWideScreen()).toBe(true);

    device.width = 3840;
    device.height = 2160;

    expect(isWideScreen()).toBe(true);

    device.width = 1920;
    device.height = 1080;

    expect(isWideScreen()).toBe(true);
  });

  it("'resolveXmlFile' should correctly parse provided path", () => {
    expect(resolveXmlFile("test.xml").ParseFile).toHaveBeenCalledWith("test.xml");

    const example: CScriptXmlInit = new CScriptXmlInit();

    expect(resolveXmlFile("another.xml", example)).toBe(example);
    expect(example.ParseFile).toHaveBeenCalledWith("another.xml");
  });

  it("'setUiVisibility' should correctly toggle visibility", () => {
    const hud: GameHud = get_hud();

    registerActor(mockActorClientGameObject());

    setUiVisibility(true);

    expect(level.show_indicators).toHaveBeenCalled();
    expect(registry.actor.disable_hit_marks).toHaveBeenCalledWith(false);
    expect(hud.show_messages).toHaveBeenCalledWith();

    registerActor(mockActorClientGameObject({ is_talking: jest.fn(() => true) }));

    setUiVisibility(false);

    expect(registry.actor.is_talking).toHaveBeenCalled();
    expect(registry.actor.stop_talk).toHaveBeenCalled();
    expect(level.hide_indicators_safe).toHaveBeenCalled();
    expect(hud.HideActorMenu).toHaveBeenCalled();
    expect(hud.HidePdaMenu).toHaveBeenCalled();
    expect(hud.hide_messages).toHaveBeenCalled();
    expect(registry.actor.disable_hit_marks).toHaveBeenCalledWith(true);
  });

  it("'resolveXmlFormPath' should fail on non-windows paths", () => {
    expect(() => resolveXmlFormPath("a/b/c.xml")).toThrow();
    expect(() => resolveXmlFormPath("a/c.xml")).toThrow();
    expect(() => resolveXmlFormPath("/another.xml")).toThrow();
    expect(() => resolveXmlFormPath("another.xml")).not.toThrow();
    expect(() => resolveXmlFormPath("a\\b\\another.xml")).not.toThrow();
    expect(() => resolveXmlFormPath("\\another.xml")).not.toThrow();
  });

  it("'resolveXmlFormPath' should normalize path", () => {
    expect(resolveXmlFormPath("a")).toBe("a.xml");
    expect(resolveXmlFormPath("a.xml")).toBe("a.xml");
    expect(resolveXmlFormPath("a\\b")).toBe("a\\b.xml");
    expect(resolveXmlFormPath("a\\b.xml")).toBe("a\\b.xml");

    MockFileSystem.getInstance().setMock(roots.gameConfig, "ui\\a\\b.16.xml", true);
    MockFileSystem.getInstance().setMock(roots.gameConfig, "ui\\a\\c.16.xml", false);

    expect(resolveXmlFormPath("a", true)).toBe("a.xml");
    expect(resolveXmlFormPath("a\\b", true)).toBe("a\\b.16.xml");
    expect(resolveXmlFormPath("a\\b.xml", true)).toBe("a\\b.16.xml");
    expect(resolveXmlFormPath("a\\c.xml", true)).toBe("a\\c.xml");
  });
});
