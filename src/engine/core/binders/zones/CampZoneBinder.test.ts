import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { CampManager } from "@/engine/core/ai/camp";
import { CampZoneBinder } from "@/engine/core/binders/zones/CampZoneBinder";
import { registry } from "@/engine/core/database";
import { GameObject, IniFile, ServerObject } from "@/engine/lib/types";
import { resetRegistry } from "@/fixtures/engine";
import { MockAlifeObject, MockGameObject, MockIniFile, MockObjectBinder } from "@/fixtures/xray";

describe("CampZoneBinder", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should correctly reinit", () => {
    const object: GameObject = MockGameObject.mock();
    const binder: CampZoneBinder = new CampZoneBinder(object);

    binder.reinit();

    expect(registry.objects.length()).toBe(1);
    expect(registry.zones.length()).toBe(1);
    expect(registry.camps.length()).toBe(0);
  });

  it("should correctly handle going online and offline when spawn check is falsy", () => {
    const serverObject: ServerObject = MockAlifeObject.mock();
    const object: GameObject = MockGameObject.mock({ id: serverObject.id });
    const binder: CampZoneBinder = new CampZoneBinder(object);

    (binder as unknown as MockObjectBinder).canSpawn = false;

    expect(binder.net_spawn(serverObject)).toBe(false);
    expect(registry.objects.length()).toBe(0);
  });

  it("should correctly handle going online and offline with no camp section", () => {
    const serverObject: ServerObject = MockAlifeObject.mock();
    const object: GameObject = MockGameObject.mock({ id: serverObject.id });
    const binder: CampZoneBinder = new CampZoneBinder(object);

    binder.net_spawn(serverObject);

    expect(registry.objects.length()).toBe(1);
    expect(registry.zones.length()).toBe(1);
    expect(registry.camps.length()).toBe(0);

    binder.net_destroy();

    expect(registry.objects.length()).toBe(0);
    expect(registry.zones.length()).toBe(0);
    expect(registry.camps.length()).toBe(0);
  });

  it("should correctly handle going online and offline with camp section", () => {
    const serverObject: ServerObject = MockAlifeObject.mock();
    const object: GameObject = MockGameObject.mock({ id: serverObject.id });
    const binder: CampZoneBinder = new CampZoneBinder(object);
    const ini: IniFile = MockIniFile.mock("test.ltx", {
      camp: {},
    });

    jest.spyOn(object, "spawn_ini").mockImplementation(() => ini);

    binder.net_spawn(serverObject);

    expect(registry.objects.length()).toBe(1);
    expect(registry.zones.length()).toBe(1);
    expect(registry.camps.length()).toBe(1);

    expect(registry.camps.get(object.id()).ini).toBe(ini);

    binder.net_destroy();

    expect(registry.objects.length()).toBe(0);
    expect(registry.zones.length()).toBe(0);
    expect(registry.camps.length()).toBe(0);
  });

  it("should correctly handle going online and offline with camp section and custom config", () => {
    const serverObject: ServerObject = MockAlifeObject.mock();
    const object: GameObject = MockGameObject.mock({ id: serverObject.id });
    const binder: CampZoneBinder = new CampZoneBinder(object);
    const ini: IniFile = MockIniFile.mock("test.ltx", {
      camp: {
        cfg: "custom_path.ltx",
      },
    });

    jest.spyOn(object, "spawn_ini").mockImplementation(() => ini);

    binder.net_spawn(serverObject);

    expect(registry.camps.get(object.id()).ini.fname()).toBe("custom_path.ltx");
  });

  it("should correctly handle update ticks", () => {
    const serverObject: ServerObject = MockAlifeObject.mock();
    const object: GameObject = MockGameObject.mock({ id: serverObject.id });
    const binder: CampZoneBinder = new CampZoneBinder(object);

    jest.spyOn(object, "spawn_ini").mockImplementation(() => {
      return MockIniFile.mock("test.ltx", {
        camp: {},
      });
    });

    binder.net_spawn(serverObject);

    const manager: CampManager = registry.camps.get(object.id());

    jest.spyOn(manager, "update").mockImplementation(jest.fn());

    binder.update(150);

    expect(manager.update).toHaveBeenCalledTimes(1);
    expect(manager.update).toHaveBeenCalledWith(150);
  });

  it("should be marked as save relevant", () => {
    const object: GameObject = MockGameObject.mock();
    const binder: CampZoneBinder = new CampZoneBinder(object);

    expect(binder.net_save_relevant()).toBe(true);
  });
});
