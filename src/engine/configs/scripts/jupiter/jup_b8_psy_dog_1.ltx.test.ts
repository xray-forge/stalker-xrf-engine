import { beforeEach, describe, expect, it } from "@jest/globals";
import { GameObject, IniFile } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { registerActor } from "@/engine/core/database";
import { pickSectionFromCondList, readIniConditionList } from "@/engine/core/ini";
import { IBaseSchemeLogic } from "@/engine/core/schemes/state";
import { giveInfoPortion, hasInfoPortion } from "@/engine/core/utils/info_portion";
import { loadInGameTestIniFromTest, resetRegistry } from "@/fixtures/engine";

describe("jup_b8_psy_dog_1 config", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should move the dog to the searched home after the heli is searched", async () => {
    const ini: IniFile = await loadInGameTestIniFromTest("jup_b8_psy_dog_1.ltx");
    const actor: GameObject = MockGameObject.mock();
    const dog: GameObject = MockGameObject.mock();
    const condition: IBaseSchemeLogic = readIniConditionList(ini, "mob_home@2", "on_info") as IBaseSchemeLogic;

    expect(condition).toBeDefined();

    registerActor(actor);

    expect(pickSectionFromCondList(actor, dog, condition.condlist)).toBeNull();

    giveInfoPortion("jup_b8_heli_4_searched");

    expect(pickSectionFromCondList(actor, dog, condition.condlist)).toBe("mob_home@1");
  });

  it("should record a hit before moving the dog to the searched home", async () => {
    const ini: IniFile = await loadInGameTestIniFromTest("jup_b8_psy_dog_1.ltx");
    const actor: GameObject = MockGameObject.mock();
    const dog: GameObject = MockGameObject.mock();
    const onHit: IBaseSchemeLogic = readIniConditionList(ini, "hit", "on_info") as IBaseSchemeLogic;
    const onHitInfo: IBaseSchemeLogic = readIniConditionList(ini, "mob_home@2", "on_info2") as IBaseSchemeLogic;

    expect(onHit).toBeDefined();
    expect(onHitInfo).toBeDefined();

    registerActor(actor);

    pickSectionFromCondList(actor, dog, onHit.condlist);

    expect(hasInfoPortion("jup_b8_psy_dog_hit")).toBe(true);
    expect(pickSectionFromCondList(actor, dog, onHitInfo.condlist)).toBe("mob_home@1");
  });
});
