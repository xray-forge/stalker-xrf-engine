import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { clsid } from "xray16";

import { registerSimulator } from "@/engine/core/database";
import { AnyObject, GameObject } from "@/engine/lib/types";
import { MockGameObject, mockIniFile } from "@/fixtures/xray";

describe("bind entry point", () => {
  const checkBinding = (name: string, container: AnyObject = global) => {
    expect(container["bind"]).toBeDefined();
    expect(typeof container["bind"]).toBe("object");
    expect(typeof container["bind"][name]).toBe("function");
  };

  const callBinding = (name: string, object: GameObject, container: AnyObject = global) => {
    return container["bind"][name](object);
  };

  beforeEach(() => {
    registerSimulator();
  });

  it("should correctly inject binding for game objects", () => {
    require("@/engine/scripts/bind");

    checkBinding("actor");
    checkBinding("anomaly_field");
    checkBinding("anomaly_zone");
    checkBinding("arena_zone");
    checkBinding("artefact");
    checkBinding("camp");
    checkBinding("campfire");
    checkBinding("crow");
    checkBinding("helicopter");
    checkBinding("door");
    checkBinding("level_changer");
    checkBinding("monster");
    checkBinding("phantom");
    checkBinding("physic_object");
    checkBinding("restrictor");
    checkBinding("signal_light");
    checkBinding("smart_cover");
    checkBinding("smart_terrain");
    checkBinding("stalker");
    checkBinding("weapon");
    checkBinding("outfit");
  });

  it("should correctly bind actor", () => {
    const actor: GameObject = MockGameObject.mockActor();

    callBinding("actor", actor);
    expect(actor.bind_object).toHaveBeenCalled();
  });

  it("should correctly bind anomaly fields", () => {
    const field: GameObject = MockGameObject.mock();

    callBinding("anomaly_field", field);
    expect(field.bind_object).toHaveBeenCalled();
  });

  it("should correctly bind anomaly zones", () => {
    const zone: GameObject = MockGameObject.mock();

    callBinding("anomaly_zone", zone);
    expect(zone.bind_object).toHaveBeenCalled();
  });

  it("should correctly bind arena zones", () => {
    const zone: GameObject = MockGameObject.mock();

    callBinding("arena_zone", zone);
    expect(zone.bind_object).not.toHaveBeenCalled();

    jest.spyOn(zone, "spawn_ini").mockImplementation(() => {
      return mockIniFile("test.ltx", {
        arena_zone: "test",
      });
    });

    callBinding("arena_zone", zone);
    expect(zone.bind_object).toHaveBeenCalled();
  });

  it("should correctly bind artefacts", () => {
    const artefact: GameObject = MockGameObject.mock();

    callBinding("artefact", artefact);
    expect(artefact.bind_object).toHaveBeenCalled();
  });

  it("should correctly bind camp", () => {
    const camp: GameObject = MockGameObject.mock();

    callBinding("camp", camp);
    expect(camp.bind_object).toHaveBeenCalled();
  });

  it("should correctly bind campfire", () => {
    const campfire: GameObject = MockGameObject.mock();

    callBinding("campfire", campfire);
    expect(campfire.bind_object).toHaveBeenCalled();
  });

  it("should correctly bind crow", () => {
    const crow: GameObject = MockGameObject.mock();

    callBinding("crow", crow);
    expect(crow.bind_object).toHaveBeenCalled();
  });

  it("should correctly bind helicopter", () => {
    const helicopter: GameObject = MockGameObject.mock();

    callBinding("helicopter", helicopter);
    expect(helicopter.bind_object).not.toHaveBeenCalled();

    jest.spyOn(helicopter, "spawn_ini").mockImplementation(() => {
      return mockIniFile("test.ltx", {
        logic: "test",
      });
    });

    callBinding("helicopter", helicopter);
    expect(helicopter.bind_object).toHaveBeenCalled();
  });

  it("should correctly bind doors", () => {
    const door: GameObject = MockGameObject.mock();

    callBinding("door", door);
    expect(door.bind_object).toHaveBeenCalled();
  });

  it("should correctly bind level changer", () => {
    const levelChanger: GameObject = MockGameObject.mock();

    callBinding("level_changer", levelChanger);
    expect(levelChanger.bind_object).toHaveBeenCalled();
  });

  it("should correctly bind monster", () => {
    const monster: GameObject = MockGameObject.mock();

    callBinding("monster", monster);
    expect(monster.bind_object).toHaveBeenCalled();
  });

  it("should correctly bind phantom", () => {
    const phantom: GameObject = MockGameObject.mock();

    callBinding("phantom", phantom);
    expect(phantom.bind_object).toHaveBeenCalled();
  });

  it("should correctly bind physic object", () => {
    const object: GameObject = MockGameObject.mock();

    callBinding("physic_object", object);
    expect(object.bind_object).not.toHaveBeenCalled();

    jest.spyOn(object, "spawn_ini").mockImplementation(() => {
      return mockIniFile("test.ltx", {
        logic: "test",
      });
    });

    callBinding("physic_object", object);
    expect(object.bind_object).toHaveBeenCalledTimes(1);

    jest.spyOn(object, "spawn_ini").mockImplementation(() => mockIniFile("test.ltx", {}));
    jest.spyOn(object, "clsid").mockImplementation(() => clsid.obj_physic);

    callBinding("physic_object", object);
    expect(object.bind_object).toHaveBeenCalledTimes(1);
  });

  it("should correctly bind restrictor", () => {
    const restrictor: GameObject = MockGameObject.mock();

    callBinding("restrictor", restrictor);
    expect(restrictor.bind_object).toHaveBeenCalled();
  });

  it("should correctly bind signal light", () => {
    const light: GameObject = MockGameObject.mock();

    callBinding("signal_light", light);
    expect(light.bind_object).toHaveBeenCalled();
  });

  it("should correctly bind smart_cover", () => {
    const cover: GameObject = MockGameObject.mock();

    callBinding("smart_cover", cover);
    expect(cover.bind_object).toHaveBeenCalled();
  });

  it("should correctly bind smart terrain", () => {
    const firstTerrain: GameObject = MockGameObject.mock();
    const secondTerrain: GameObject = MockGameObject.mock();
    const thirdTerrain: GameObject = MockGameObject.mock();

    callBinding("smart_terrain", firstTerrain);
    expect(firstTerrain.bind_object).not.toHaveBeenCalled();
    callBinding("smart_terrain", secondTerrain);
    expect(secondTerrain.bind_object).not.toHaveBeenCalled();
    callBinding("smart_terrain", thirdTerrain);
    expect(thirdTerrain.bind_object).not.toHaveBeenCalled();

    jest.spyOn(secondTerrain, "spawn_ini").mockImplementation(() => {
      return mockIniFile("test.ltx", {
        smart_terrain: {},
      });
    });

    registerSimulator();

    callBinding("smart_terrain", firstTerrain);
    expect(firstTerrain.bind_object).not.toHaveBeenCalled();
    callBinding("smart_terrain", secondTerrain);
    expect(secondTerrain.bind_object).toHaveBeenCalled();
  });

  it("should correctly bind stalker", () => {
    const stalker: GameObject = MockGameObject.mock();

    callBinding("stalker", stalker);
    expect(stalker.bind_object).toHaveBeenCalled();
  });

  it("should correctly bind weapon", () => {
    const stalker: GameObject = MockGameObject.mock();

    callBinding("weapon", stalker);
    expect(stalker.bind_object).toHaveBeenCalled();
  });

  it("should correctly bind outfit", () => {
    const stalker: GameObject = MockGameObject.mock();

    callBinding("outfit", stalker);
    expect(stalker.bind_object).toHaveBeenCalled();
  });

  it("should correctly bind helmet", () => {
    const stalker: GameObject = MockGameObject.mock();

    callBinding("helmet", stalker);
    expect(stalker.bind_object).toHaveBeenCalled();
  });
});
