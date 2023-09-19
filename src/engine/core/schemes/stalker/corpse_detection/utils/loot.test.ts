import { describe, expect, it, jest } from "@jest/globals";

import { IRegistryObjectState, registerObject } from "@/engine/core/database";
import { GlobalSoundManager } from "@/engine/core/managers/sounds/GlobalSoundManager";
import {
  finishCorpseLooting,
  ISchemeCorpseDetectionState,
  SchemeCorpseDetection,
} from "@/engine/core/schemes/stalker/corpse_detection";
import { loadSchemeImplementation } from "@/engine/core/utils/scheme";
import { weapons } from "@/engine/lib/constants/items/weapons";
import { ClientObject, EScheme } from "@/engine/lib/types";
import { replaceFunctionMock } from "@/fixtures/jest";
import { mockClientGameObject, mockIniFile } from "@/fixtures/xray";

describe("loot utils for corpse_detection scheme", () => {
  it("'finishCorpseLooting' should correctly finish looting", () => {
    const soundManager: GlobalSoundManager = GlobalSoundManager.getInstance();

    const ak74: ClientObject = mockClientGameObject({ sectionOverride: weapons.wpn_ak74 });
    const questItem: ClientObject = mockClientGameObject({ sectionOverride: "some_quest_item" });

    const object: ClientObject = mockClientGameObject();
    const corpse: ClientObject = mockClientGameObject({
      inventory: [
        [ak74.section(), ak74],
        [questItem.section(), questItem],
      ],
    });

    const state: IRegistryObjectState = registerObject(object);

    jest.spyOn(soundManager, "playSound").mockImplementation(() => null);
    jest.spyOn(math, "random").mockImplementation(() => 0);
    loadSchemeImplementation(SchemeCorpseDetection);

    SchemeCorpseDetection.activate(
      object,
      mockIniFile("test.ltx", {}),
      EScheme.CORPSE_DETECTION,
      "corpse_detection@test"
    );

    finishCorpseLooting(object);
    expect(corpse.object(questItem.section())).toBe(questItem);
    expect(corpse.object(ak74.section())).toBe(ak74);
    expect(soundManager.playSound).not.toHaveBeenCalled();

    registerObject(corpse);
    finishCorpseLooting(object);
    expect(corpse.object(questItem.section())).toBe(questItem);
    expect(corpse.object(ak74.section())).toBe(ak74);
    expect(soundManager.playSound).not.toHaveBeenCalled();

    (state[EScheme.CORPSE_DETECTION] as ISchemeCorpseDetectionState).selectedCorpseId = corpse.id();

    registerObject(corpse);
    finishCorpseLooting(object);

    expect(corpse.object(questItem.section())).toBe(questItem);
    expect(corpse.object(ak74.section())).toBeNull();
    expect(object.object(ak74.section())).toBe(ak74);
    expect(soundManager.playSound).toHaveBeenCalledWith(object.id(), "corpse_loot_good");

    replaceFunctionMock(soundManager.playSound, () => 0);

    finishCorpseLooting(object);

    // Nothing to loot -> bad loot notification.
    expect(corpse.object(questItem.section())).toBe(questItem);
    expect(corpse.object(ak74.section())).toBeNull();
    expect(object.object(ak74.section())).toBe(ak74);
    expect(soundManager.playSound).toHaveBeenCalledWith(object.id(), "corpse_loot_bad");
  });
});
