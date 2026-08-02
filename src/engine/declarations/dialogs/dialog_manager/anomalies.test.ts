import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { AnyArgs, AnyObject, Nillable, TName, TStringId } from "xray16/lib";
import { MockGameObject } from "xray16/mocks";
import { replaceFunctionMockOnce, resetFunctionMock } from "xray16/testing/utils";

import { getManager } from "@/engine/core/database";
import { DialogManager, EGenericPhraseCategory } from "@/engine/core/managers/dialogs";
import { dialogConfig } from "@/engine/core/managers/dialogs/DialogConfig";
import { processPhraseAction, shouldHidePhraseCategory, shouldShowPhrase } from "@/engine/core/managers/dialogs/utils";
import { getObjectTerrain } from "@/engine/core/utils/position";
import { mockRegisteredActor, MockSmartTerrain, resetRegistry } from "@/fixtures/engine";

function callDialogBinding<T = void>(name: TName, ...parameters: AnyArgs): T {
  const effects: Nillable<AnyObject> = (_G as AnyObject)["dialog_manager"];

  if (effects && name in effects) {
    return (_G as AnyObject)["dialog_manager"][name](...parameters);
  } else if (!effects) {
    throw new Error("Unexpected call - 'dialog_manager' global is not registered.");
  } else {
    throw new Error(`Unexpected method provided - '${name}', no matching methods in dialog_manager globals.`);
  }
}

jest.mock("@/engine/core/managers/dialogs/utils/dialog_action");
jest.mock("@/engine/core/managers/dialogs/utils/dialog_check");
jest.mock("@/engine/core/utils/position");

beforeAll(() => {
  require("@/engine/declarations/dialogs/dialog_manager/anomalies");
});

beforeEach(() => {
  resetRegistry();

  resetFunctionMock(processPhraseAction);
  resetFunctionMock(shouldHidePhraseCategory);
  resetFunctionMock(shouldShowPhrase);
  resetFunctionMock(getObjectTerrain);
});

describe("action_anomalies_dialogs", () => {
  it("should process and mark the anomaly category as told", () => {
    const { actorGameObject } = mockRegisteredActor();
    const object: GameObject = MockGameObject.mockStalker();
    const manager: DialogManager = getManager(DialogManager);

    manager.priorityTable.get(EGenericPhraseCategory.ANOMALIES).set(object.id(), { told: false } as never);

    callDialogBinding("action_anomalies_dialogs", object, actorGameObject, "dialog", "phrase");

    expect(processPhraseAction).toHaveBeenCalledWith(
      object.id(),
      dialogConfig.PHRASES.get(EGenericPhraseCategory.ANOMALIES),
      manager.priorityTable.get(EGenericPhraseCategory.ANOMALIES),
      "phrase"
    );
    expect(manager.priorityTable.get(EGenericPhraseCategory.ANOMALIES).get(object.id()).told).toBe(true);
  });
});

describe("precondition_anomalies_dialogs_no_more", () => {
  it("should report the anomaly category completion", () => {
    const { actorGameObject } = mockRegisteredActor();
    const manager: DialogManager = getManager(DialogManager);

    jest.spyOn(manager, "isObjectPhraseCategoryTold").mockReturnValue(true);

    expect(callDialogBinding("precondition_anomalies_dialogs_no_more", actorGameObject)).toBe(true);
    expect(manager.isObjectPhraseCategoryTold).toHaveBeenCalledWith(
      actorGameObject.id(),
      EGenericPhraseCategory.ANOMALIES
    );
  });
});

describe("precondition_anomalies_dialogs_do_not_know", () => {
  it("should delegate anomalies visibility checks", () => {
    const { actorGameObject } = mockRegisteredActor();

    replaceFunctionMockOnce(shouldHidePhraseCategory, () => true);

    expect(callDialogBinding("precondition_anomalies_dialogs_do_not_know", actorGameObject)).toBe(true);
    expect(shouldHidePhraseCategory).toHaveBeenCalledWith(actorGameObject, EGenericPhraseCategory.ANOMALIES);
  });
});

describe("precondition_anomalies_dialogs", () => {
  it("should delegate anomaly phrase visibility when the object has no terrain", () => {
    const { actorGameObject } = mockRegisteredActor();
    const object: GameObject = MockGameObject.mockStalker();

    replaceFunctionMockOnce(getObjectTerrain, () => null);
    replaceFunctionMockOnce(shouldShowPhrase, () => true);

    expect(
      callDialogBinding("precondition_anomalies_dialogs", object, actorGameObject, "dialog", "parent", "phrase")
    ).toBe(true);
    expect(shouldShowPhrase).toHaveBeenCalledWith(
      object,
      dialogConfig.PHRASES.get(EGenericPhraseCategory.ANOMALIES),
      getManager(DialogManager).priorityTable.get(EGenericPhraseCategory.ANOMALIES),
      "phrase"
    );
  });

  it("should blacklist and hide an anomaly phrase describing the terrain the object already lives in", () => {
    const { actorGameObject } = mockRegisteredActor();
    const object: GameObject = MockGameObject.mockStalker();
    const manager: DialogManager = getManager(DialogManager);

    // Pick the configured anomaly phrase that is bound to a specific terrain.
    let phraseId: TStringId = "";
    let terrainName: TName = "";

    for (const [id, descriptor] of dialogConfig.PHRASES.get(EGenericPhraseCategory.ANOMALIES)) {
      if (descriptor.smart) {
        phraseId = id;
        terrainName = descriptor.smart;
        break;
      }
    }

    expect(phraseId).not.toBe("");

    manager.priorityTable.get(EGenericPhraseCategory.ANOMALIES).set(object.id(), new LuaTable());
    replaceFunctionMockOnce(getObjectTerrain, () => MockSmartTerrain.mock(terrainName));

    expect(
      callDialogBinding("precondition_anomalies_dialogs", object, actorGameObject, "dialog", "parent", phraseId)
    ).toBe(false);
    expect(manager.priorityTable.get(EGenericPhraseCategory.ANOMALIES).get(object.id()).get(phraseId)).toBe(-1);
    expect(shouldShowPhrase).not.toHaveBeenCalled();
  });
});
