import { beforeEach, describe, expect, it } from "@jest/globals";
import { clsid } from "xray16";

import { registerSimulator } from "@/engine/core/database";
import {
  getObjectActiveWeaponSlot,
  getObjectCommunity,
  getObjectPositioning,
  getObjectSmartTerrain,
  getObjectSquad,
} from "@/engine/core/utils/object/object_get";
import {
  ClientObject,
  ServerGroupObject,
  ServerHumanObject,
  ServerSmartZoneObject,
  TClassId,
} from "@/engine/lib/types";
import { replaceFunctionMock } from "@/fixtures/jest";
import {
  mockClientGameObject,
  mockServerAlifeHumanStalker,
  mockServerAlifeOnlineOfflineGroup,
  mockServerAlifeSmartZone,
} from "@/fixtures/xray";

describe("object get utils", () => {
  beforeEach(() => registerSimulator());

  it("getObjectPositioning should correctly get positioning", () => {
    expect(getObjectPositioning(mockClientGameObject())).toEqual([
      1000,
      512,
      255,
      {
        x: 0.25,
        y: 0.25,
        z: 0.25,
      },
    ]);
    expect(getObjectPositioning(mockServerAlifeHumanStalker())).toEqual([
      100000,
      512,
      255,
      {
        x: 0.25,
        y: 0.25,
        z: 0.25,
      },
    ]);
  });

  it("getObjectSquad should correctly get squad of an object", () => {
    expect(getObjectSquad(mockClientGameObject())).toBeNull();
    expect(getObjectSquad(mockServerAlifeHumanStalker())).toBeNull();

    const clientObject: ClientObject = mockClientGameObject();
    const groupObject: ServerGroupObject = mockServerAlifeOnlineOfflineGroup();
    const serverObject: ServerHumanObject = mockServerAlifeHumanStalker({
      id: clientObject.id(),
      group_id: groupObject.id,
    });

    expect(getObjectSquad(clientObject)).toBe(groupObject);
    expect(getObjectSquad(serverObject)).toBe(groupObject);

    serverObject.group_id = 99_999;

    expect(getObjectSquad(clientObject)).toBeNull();
    expect(getObjectSquad(serverObject)).toBeNull();
  });

  it("getObjectSmartTerrain should correctly get smart terrain of an object", () => {
    expect(getObjectSmartTerrain(mockClientGameObject())).toBeNull();
    expect(getObjectSmartTerrain(mockServerAlifeHumanStalker())).toBeNull();

    const clientObject: ClientObject = mockClientGameObject();
    const smartTerrainObject: ServerSmartZoneObject = mockServerAlifeSmartZone();
    const serverObject: ServerHumanObject = mockServerAlifeHumanStalker({
      id: clientObject.id(),
      m_smart_terrain_id: smartTerrainObject.id,
    });

    expect(getObjectSmartTerrain(clientObject)).toBe(smartTerrainObject);
    expect(getObjectSmartTerrain(serverObject)).toBe(smartTerrainObject);

    serverObject.m_smart_terrain_id = 99_999;

    expect(getObjectSmartTerrain(clientObject)).toBeNull();
    expect(getObjectSmartTerrain(serverObject)).toBeNull();
  });

  it("getObjectCommunity should correctly get community", () => {
    expect(getObjectCommunity(mockClientGameObject())).toBe("monster");
    expect(getObjectCommunity(mockServerAlifeHumanStalker())).toBe("stalker");

    const clientObject: ClientObject = mockClientGameObject({ clsid: () => clsid.script_stalker as TClassId });
    const serverObject: ServerHumanObject = mockServerAlifeHumanStalker({
      clsid: () => clsid.script_stalker as TClassId,
    });

    expect(getObjectCommunity(clientObject)).toBe("stalker");
    expect(getObjectCommunity(serverObject)).toBe("stalker");

    replaceFunctionMock(clientObject.character_community, () => "monolith");
    replaceFunctionMock(serverObject.community, () => "army");

    expect(getObjectCommunity(clientObject)).toBe("monolith");
    expect(getObjectCommunity(serverObject)).toBe("army");
  });

  it("getObjectActiveWeaponSlot should correctly get slot", () => {
    const object: ClientObject = mockClientGameObject();

    replaceFunctionMock(object.active_item, () => null);
    replaceFunctionMock(object.weapon_strapped, () => true);
    expect(getObjectActiveWeaponSlot(object)).toBe(0);

    replaceFunctionMock(object.active_item, () => mockClientGameObject({ animation_slot: () => 4 }));
    expect(getObjectActiveWeaponSlot(object)).toBe(0);

    replaceFunctionMock(object.weapon_strapped, () => false);
    expect(getObjectActiveWeaponSlot(object)).toBe(4);

    replaceFunctionMock(object.active_item, () => mockClientGameObject({ animation_slot: () => 3 }));
    expect(getObjectActiveWeaponSlot(object)).toBe(3);
  });
});
