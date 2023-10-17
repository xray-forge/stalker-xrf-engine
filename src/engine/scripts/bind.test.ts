import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { clsid } from "xray16";

import { registerSimulator } from "@/engine/core/database";
import { AnyObject, GameObject } from "@/engine/lib/types";
import { mockActorGameObject, mockGameObject, mockIniFile } from "@/fixtures/xray";

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
    checkBinding("anomalyField");
    checkBinding("anomalyZone");
    checkBinding("artefact");
    checkBinding("camp");
    checkBinding("campfire");
    checkBinding("crow");
    checkBinding("heli");
    checkBinding("labX8Door");
    checkBinding("levelChanger");
    checkBinding("monster");
    checkBinding("phantom");
    checkBinding("physicObject");
    checkBinding("restrictor");
    checkBinding("signalLight");
    checkBinding("smartCover");
    checkBinding("smartTerrain");
    checkBinding("stalker");
    checkBinding("weapon");
    checkBinding("outfit");
  });

  it("should correctly bind actor", () => {
    const actor: GameObject = mockActorGameObject();

    callBinding("actor", actor);
    expect(actor.bind_object).toHaveBeenCalled();
  });

  it("should correctly bind anomaly fields", () => {
    const anomalyField: GameObject = mockGameObject();

    callBinding("anomalyField", anomalyField);
    expect(anomalyField.bind_object).toHaveBeenCalled();
  });

  it("should correctly bind anomaly zones", () => {
    const anomalyZone: GameObject = mockGameObject();

    callBinding("anomalyZone", anomalyZone);
    expect(anomalyZone.bind_object).toHaveBeenCalled();
  });

  it("should correctly bind arena zones", () => {
    const arenaZone: GameObject = mockGameObject();

    callBinding("arenaZone", arenaZone);
    expect(arenaZone.bind_object).not.toHaveBeenCalled();

    jest.spyOn(arenaZone, "spawn_ini").mockImplementation(() => {
      return mockIniFile("test.ltx", {
        arena_zone: "test",
      });
    });

    callBinding("arenaZone", arenaZone);
    expect(arenaZone.bind_object).toHaveBeenCalled();
  });

  it("should correctly bind artefacts", () => {
    const artefact: GameObject = mockGameObject();

    callBinding("artefact", artefact);
    expect(artefact.bind_object).toHaveBeenCalled();
  });

  it("should correctly bind camp", () => {
    const camp: GameObject = mockGameObject();

    callBinding("camp", camp);
    expect(camp.bind_object).toHaveBeenCalled();
  });

  it("should correctly bind campfire", () => {
    const campfire: GameObject = mockGameObject();

    callBinding("campfire", campfire);
    expect(campfire.bind_object).toHaveBeenCalled();
  });

  it("should correctly bind crow", () => {
    const crow: GameObject = mockGameObject();

    callBinding("crow", crow);
    expect(crow.bind_object).toHaveBeenCalled();
  });

  it("should correctly bind heli", () => {
    const heli: GameObject = mockGameObject();

    callBinding("heli", heli);
    expect(heli.bind_object).not.toHaveBeenCalled();

    jest.spyOn(heli, "spawn_ini").mockImplementation(() => {
      return mockIniFile("test.ltx", {
        logic: "test",
      });
    });

    callBinding("heli", heli);
    expect(heli.bind_object).toHaveBeenCalled();
  });

  it("should correctly bind labX8Door", () => {
    const door: GameObject = mockGameObject();

    callBinding("labX8Door", door);
    expect(door.bind_object).toHaveBeenCalled();
  });

  it("should correctly bind level changer", () => {
    const levelChanger: GameObject = mockGameObject();

    callBinding("levelChanger", levelChanger);
    expect(levelChanger.bind_object).toHaveBeenCalled();
  });

  it("should correctly bind monster", () => {
    const monster: GameObject = mockGameObject();

    callBinding("monster", monster);
    expect(monster.bind_object).toHaveBeenCalled();
  });

  it("should correctly bind phantom", () => {
    const phantom: GameObject = mockGameObject();

    callBinding("phantom", phantom);
    expect(phantom.bind_object).toHaveBeenCalled();
  });

  it("should correctly bind physic object", () => {
    const physicObject: GameObject = mockGameObject();

    callBinding("physicObject", physicObject);
    expect(physicObject.bind_object).not.toHaveBeenCalled();

    jest.spyOn(physicObject, "clsid").mockImplementation(() => clsid.inventory_box);

    callBinding("physicObject", physicObject);
    expect(physicObject.bind_object).toHaveBeenCalledTimes(1);

    jest.spyOn(physicObject, "spawn_ini").mockImplementation(() => {
      return mockIniFile("test.ltx", {
        logic: "test",
      });
    });

    callBinding("physicObject", physicObject);
    expect(physicObject.bind_object).toHaveBeenCalledTimes(2);

    jest.spyOn(physicObject, "spawn_ini").mockImplementation(() => mockIniFile("test.ltx", {}));
    jest.spyOn(physicObject, "clsid").mockImplementation(() => clsid.obj_physic);

    callBinding("physicObject", physicObject);
    expect(physicObject.bind_object).toHaveBeenCalledTimes(2);
  });

  it("should correctly bind restrictor", () => {
    const restrictor: GameObject = mockGameObject();

    callBinding("restrictor", restrictor);
    expect(restrictor.bind_object).toHaveBeenCalled();
  });

  it("should correctly bind signalLight", () => {
    const signalLight: GameObject = mockGameObject();

    callBinding("signalLight", signalLight);
    expect(signalLight.bind_object).toHaveBeenCalled();
  });

  it("should correctly bind smartCover", () => {
    const smartCover: GameObject = mockGameObject();

    callBinding("smartCover", smartCover);
    expect(smartCover.bind_object).toHaveBeenCalled();
  });

  it("should correctly bind smartTerrain", () => {
    const firstSmartTerrain: GameObject = mockGameObject();
    const secondSmartTerrain: GameObject = mockGameObject();
    const thirdSmartTerrain: GameObject = mockGameObject();

    callBinding("smartTerrain", firstSmartTerrain);
    expect(firstSmartTerrain.bind_object).not.toHaveBeenCalled();
    callBinding("smartTerrain", secondSmartTerrain);
    expect(secondSmartTerrain.bind_object).not.toHaveBeenCalled();
    callBinding("smartTerrain", thirdSmartTerrain);
    expect(thirdSmartTerrain.bind_object).not.toHaveBeenCalled();

    jest.spyOn(secondSmartTerrain, "spawn_ini").mockImplementation(() => {
      return mockIniFile("test.ltx", {
        smart_terrain: {},
      });
    });

    registerSimulator();

    callBinding("smartTerrain", firstSmartTerrain);
    expect(firstSmartTerrain.bind_object).not.toHaveBeenCalled();
    callBinding("smartTerrain", secondSmartTerrain);
    expect(secondSmartTerrain.bind_object).toHaveBeenCalled();
  });

  it("should correctly bind stalker", () => {
    const stalker: GameObject = mockGameObject();

    callBinding("stalker", stalker);
    expect(stalker.bind_object).toHaveBeenCalled();
  });

  it("should correctly bind weapon", () => {
    const stalker: GameObject = mockGameObject();

    callBinding("weapon", stalker);
    expect(stalker.bind_object).toHaveBeenCalled();
  });

  it("should correctly bind outfit", () => {
    const stalker: GameObject = mockGameObject();

    callBinding("outfit", stalker);
    expect(stalker.bind_object).toHaveBeenCalled();
  });

  it("should correctly bind helmet", () => {
    const stalker: GameObject = mockGameObject();

    callBinding("helmet", stalker);
    expect(stalker.bind_object).toHaveBeenCalled();
  });
});
