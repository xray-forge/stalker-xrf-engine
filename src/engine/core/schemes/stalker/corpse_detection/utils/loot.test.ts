import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import {
  getManager,
  getPortableStoreValue,
  IRegistryObjectState,
  registerObject,
  setPortableStoreValue,
} from "@/engine/core/database";
import { SoundManager } from "@/engine/core/managers/sounds/SoundManager";
import {
  finishCorpseLooting,
  freeSelectedLootedObjectSpot,
  ISchemeCorpseDetectionState,
  PS_LOOTING_DEAD_OBJECT,
  SchemeCorpseDetection,
} from "@/engine/core/schemes/stalker/corpse_detection";
import { loadSchemeImplementation } from "@/engine/core/utils/scheme";
import { weapons } from "@/engine/lib/constants/items/weapons";
import { EScheme, GameObject } from "@/engine/lib/types";
import { resetRegistry } from "@/fixtures/engine";
import { replaceFunctionMock } from "@/fixtures/jest";
import { MockGameObject, MockIniFile } from "@/fixtures/xray";

describe("loot utils for corpse_detection scheme", () => {
  it("finishCorpseLooting should correctly finish looting", () => {
    const soundManager: SoundManager = getManager(SoundManager);

    const ak74: GameObject = MockGameObject.mock({ section: weapons.wpn_ak74 });
    const questItem: GameObject = MockGameObject.mock({ section: "some_quest_item" });

    const object: GameObject = MockGameObject.mock();
    const corpse: GameObject = MockGameObject.mock({
      inventory: [
        [ak74.section(), ak74],
        [questItem.section(), questItem],
      ],
    });

    const state: IRegistryObjectState = registerObject(object);

    jest.spyOn(soundManager, "play").mockImplementation(() => null);
    jest.spyOn(math, "random").mockImplementation(() => 0);
    loadSchemeImplementation(SchemeCorpseDetection);

    SchemeCorpseDetection.activate(
      object,
      MockIniFile.mock("test.ltx", {}),
      EScheme.CORPSE_DETECTION,
      "corpse_detection@test"
    );

    finishCorpseLooting(object);
    expect(corpse.object(questItem.section())).toBe(questItem);
    expect(corpse.object(ak74.section())).toBe(ak74);
    expect(soundManager.play).not.toHaveBeenCalled();

    registerObject(corpse);
    finishCorpseLooting(object);
    expect(corpse.object(questItem.section())).toBe(questItem);
    expect(corpse.object(ak74.section())).toBe(ak74);
    expect(soundManager.play).not.toHaveBeenCalled();

    (state[EScheme.CORPSE_DETECTION] as ISchemeCorpseDetectionState).selectedCorpseId = corpse.id();

    registerObject(corpse);
    finishCorpseLooting(object);

    expect(corpse.object(questItem.section())).toBe(questItem);
    expect(corpse.object(ak74.section())).toBeNull();
    expect(object.object(ak74.section())).toBe(ak74);
    expect(soundManager.play).toHaveBeenCalledWith(object.id(), "corpse_loot_good");

    replaceFunctionMock(soundManager.play, () => 0);

    finishCorpseLooting(object);

    // Nothing to loot -> bad loot notification.
    expect(corpse.object(questItem.section())).toBe(questItem);
    expect(corpse.object(ak74.section())).toBeNull();
    expect(object.object(ak74.section())).toBe(ak74);
    expect(soundManager.play).toHaveBeenCalledWith(object.id(), "corpse_loot_bad");
  });
});

describe("freeSelectedLootedObjectSpot util", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should correctly reset loot lock for not existing objects", () => {
    expect(() => freeSelectedLootedObjectSpot(-1)).not.toThrow();
    expect(() => freeSelectedLootedObjectSpot(-10)).not.toThrow();
    expect(() => freeSelectedLootedObjectSpot(-100)).not.toThrow();
  });

  it("should correctly reset loot lock that does not exists", () => {
    const object: GameObject = MockGameObject.mock();

    freeSelectedLootedObjectSpot(object.id());

    registerObject(object);
    expect(getPortableStoreValue(object.id(), PS_LOOTING_DEAD_OBJECT)).toBeNull();

    freeSelectedLootedObjectSpot(object.id());
    expect(getPortableStoreValue(object.id(), PS_LOOTING_DEAD_OBJECT)).toBeNull();
  });

  it("should correctly reset loot lock that exists", () => {
    const object: GameObject = MockGameObject.mock();

    registerObject(object);
    setPortableStoreValue(object.id(), PS_LOOTING_DEAD_OBJECT, 5000);
    expect(getPortableStoreValue(object.id(), PS_LOOTING_DEAD_OBJECT)).toBe(5000);

    freeSelectedLootedObjectSpot(object.id());
    expect(getPortableStoreValue(object.id(), PS_LOOTING_DEAD_OBJECT)).toBeNull();
  });
});
