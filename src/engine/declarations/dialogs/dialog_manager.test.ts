import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject, PhraseDialog } from "xray16/alias";
import { AnyArgs, AnyObject, Nillable, TName, TStringId } from "xray16/lib";
import { MockGameObject, MockPhraseDialog } from "xray16/mocks";
import { replaceFunctionMockOnce, resetFunctionMock } from "xray16/testing/utils";

import { getManager } from "@/engine/core/database";
import { DialogManager, EGenericPhraseCategory } from "@/engine/core/managers/dialogs";
import { dialogConfig } from "@/engine/core/managers/dialogs/DialogConfig";
import {
  fillPhrasesPriorities,
  initializeCategoryDialogs,
  initializeNewDialog,
  processPhraseAction,
  shouldHidePhraseCategory,
  shouldShowPhrase,
} from "@/engine/core/managers/dialogs/utils";
import { getObjectTerrain } from "@/engine/core/utils/position";
import { mockRegisteredActor, MockSmartTerrain, resetRegistry } from "@/fixtures/engine";

jest.mock("@/engine/core/managers/dialogs/utils/dialog_action");
jest.mock("@/engine/core/managers/dialogs/utils/dialog_check");
jest.mock("@/engine/core/managers/dialogs/utils/dialog_init");
jest.mock("@/engine/core/managers/dialogs/utils/dialog_priority");
jest.mock("@/engine/core/utils/position");

beforeAll(() => {
  require("@/engine/declarations/dialogs/dialog_manager");
});

describe("action_disable_quest_phrase", () => {
  it("should record the phrase under the NPC quest-disabled phrase table", () => {
    const { actorGameObject } = mockRegisteredActor();
    const npc: GameObject = MockGameObject.mockStalker();
    const manager: DialogManager = getManager(DialogManager);

    callDialogBinding("action_disable_quest_phrase", actorGameObject, npc, "jup_b6_dialog", "3");

    expect(manager.questDisabledPhrases.get(npc.id()).get("3")).toBe(true);
  });
});

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

beforeEach(() => {
  resetRegistry();

  resetFunctionMock(fillPhrasesPriorities);
  resetFunctionMock(initializeNewDialog);
  resetFunctionMock(initializeCategoryDialogs);
  resetFunctionMock(processPhraseAction);
  resetFunctionMock(shouldHidePhraseCategory);
  resetFunctionMock(shouldShowPhrase);
  resetFunctionMock(getObjectTerrain);
});

describe("init_new_dialog", () => {
  it("should initialize correctly", () => {
    const dialog: PhraseDialog = MockPhraseDialog.mock();

    callDialogBinding("init_new_dialog", dialog);

    expect(initializeNewDialog).toHaveBeenCalledTimes(1);
    expect(initializeNewDialog).toHaveBeenCalledWith(dialog);
  });
});

describe("initialize_start_dialogs", () => {
  it("should initialize correctly", () => {
    const dialog: PhraseDialog = MockPhraseDialog.mock();

    callDialogBinding("initialize_start_dialogs", dialog, EGenericPhraseCategory.JOB);

    expect(initializeCategoryDialogs).toHaveBeenCalledTimes(1);
    expect(initializeCategoryDialogs).toHaveBeenCalledWith(dialog, EGenericPhraseCategory.JOB);
  });
});

describe("init_hello_dialogs", () => {
  it("should initialize correctly", () => {
    const dialog: PhraseDialog = MockPhraseDialog.mock();

    callDialogBinding("init_hello_dialogs", dialog);

    expect(initializeCategoryDialogs).toHaveBeenCalledTimes(1);
    expect(initializeCategoryDialogs).toHaveBeenCalledWith(dialog, EGenericPhraseCategory.HELLO);
  });
});

describe("fill_priority_hello_table", () => {
  it("should correctly handle priorities", () => {
    const { actorGameObject } = mockRegisteredActor();
    const object: GameObject = MockGameObject.mockStalker();

    callDialogBinding("fill_priority_hello_table", actorGameObject, object);

    expect(fillPhrasesPriorities).toHaveBeenCalledTimes(1);
    expect(fillPhrasesPriorities).toHaveBeenCalledWith(
      object,
      dialogConfig.PHRASES.get(EGenericPhraseCategory.HELLO),
      getManager(DialogManager).priorityTable.get(EGenericPhraseCategory.HELLO)
    );
  });
});

describe("fill_priority_job_table", () => {
  it("should correctly handle priorities", () => {
    const { actorGameObject } = mockRegisteredActor();
    const object: GameObject = MockGameObject.mockStalker();

    callDialogBinding("fill_priority_job_table", actorGameObject, object);

    expect(fillPhrasesPriorities).toHaveBeenCalledTimes(1);
    expect(fillPhrasesPriorities).toHaveBeenCalledWith(
      object,
      dialogConfig.PHRASES.get(EGenericPhraseCategory.JOB),
      getManager(DialogManager).priorityTable.get(EGenericPhraseCategory.JOB)
    );
  });
});

describe("fill_priority_anomalies_table", () => {
  it("should correctly handle priorities", () => {
    const { actorGameObject } = mockRegisteredActor();
    const object: GameObject = MockGameObject.mockStalker();

    callDialogBinding("fill_priority_anomalies_table", actorGameObject, object);

    expect(fillPhrasesPriorities).toHaveBeenCalledTimes(1);
    expect(fillPhrasesPriorities).toHaveBeenCalledWith(
      object,
      dialogConfig.PHRASES.get(EGenericPhraseCategory.ANOMALIES),
      getManager(DialogManager).priorityTable.get(EGenericPhraseCategory.ANOMALIES)
    );
  });
});

describe("fill_priority_information_table", () => {
  it("should correctly handle priorities", () => {
    const { actorGameObject } = mockRegisteredActor();
    const object: GameObject = MockGameObject.mockStalker();

    callDialogBinding("fill_priority_information_table", actorGameObject, object);

    expect(fillPhrasesPriorities).toHaveBeenCalledTimes(1);
    expect(fillPhrasesPriorities).toHaveBeenCalledWith(
      object,
      dialogConfig.PHRASES.get(EGenericPhraseCategory.INFORMATION),
      getManager(DialogManager).priorityTable.get(EGenericPhraseCategory.INFORMATION)
    );
  });
});

describe("precondition_hello_dialogs", () => {
  it("should correctly check preconditions", () => {
    const { actorGameObject } = mockRegisteredActor();
    const object: GameObject = MockGameObject.mockStalker();

    replaceFunctionMockOnce(shouldShowPhrase, () => true);

    expect(
      callDialogBinding("precondition_hello_dialogs", actorGameObject, object, "dialog_name", "parent_id", "phrase_id")
    ).toBe(true);

    expect(shouldShowPhrase).toHaveBeenCalledTimes(1);
    expect(shouldShowPhrase).toHaveBeenCalledWith(
      actorGameObject,
      dialogConfig.PHRASES.get(EGenericPhraseCategory.HELLO),
      getManager(DialogManager).priorityTable.get(EGenericPhraseCategory.HELLO),
      "phrase_id"
    );
  });
});

describe("action_hello_dialogs", () => {
  it("should correctly switch", () => {
    const { actorGameObject } = mockRegisteredActor();
    const object: GameObject = MockGameObject.mockStalker();

    callDialogBinding("action_hello_dialogs", actorGameObject, object, "dialog_name", "parent_id");

    expect(processPhraseAction).toHaveBeenCalledTimes(1);
    expect(processPhraseAction).toHaveBeenCalledWith(
      actorGameObject.id(),
      dialogConfig.PHRASES.get(EGenericPhraseCategory.HELLO),
      getManager(DialogManager).priorityTable.get(EGenericPhraseCategory.HELLO),
      "parent_id"
    );
  });
});

describe("precondition_job_dialogs_no_more", () => {
  it("should correctly check preconditions", () => {
    const { actorGameObject } = mockRegisteredActor();
    const manager: DialogManager = getManager(DialogManager);

    jest.spyOn(manager, "isObjectPhraseCategoryTold").mockImplementationOnce(() => true);

    replaceFunctionMockOnce(shouldShowPhrase, () => true);

    expect(callDialogBinding("precondition_job_dialogs_no_more", actorGameObject)).toBe(true);

    expect(manager.isObjectPhraseCategoryTold).toHaveBeenCalledTimes(1);
    expect(manager.isObjectPhraseCategoryTold).toHaveBeenCalledWith(actorGameObject.id(), EGenericPhraseCategory.JOB);
  });
});

describe("precondition_job_dialogs_do_not_know", () => {
  it("should correctly check preconditions", () => {
    const { actorGameObject } = mockRegisteredActor();

    replaceFunctionMockOnce(shouldHidePhraseCategory, () => true);

    expect(callDialogBinding("precondition_job_dialogs_do_not_know", actorGameObject)).toBe(true);

    expect(shouldHidePhraseCategory).toHaveBeenCalledTimes(1);
    expect(shouldHidePhraseCategory).toHaveBeenCalledWith(actorGameObject, EGenericPhraseCategory.JOB);
  });
});

describe("precondition_job_dialogs", () => {
  it("should correctly check preconditions", () => {
    const { actorGameObject } = mockRegisteredActor();
    const object: GameObject = MockGameObject.mockStalker();

    replaceFunctionMockOnce(shouldShowPhrase, () => true);

    expect(
      callDialogBinding("precondition_job_dialogs", actorGameObject, object, "dialog_name", "parent_id", "phrase_id")
    ).toBe(true);

    expect(shouldShowPhrase).toHaveBeenCalledTimes(1);
    expect(shouldShowPhrase).toHaveBeenCalledWith(
      actorGameObject,
      dialogConfig.PHRASES.get(EGenericPhraseCategory.JOB),
      getManager(DialogManager).priorityTable.get(EGenericPhraseCategory.JOB),
      "phrase_id"
    );
  });
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

describe("action_job_dialogs", () => {
  it("should process and mark the job category as told", () => {
    const { actorGameObject } = mockRegisteredActor();
    const object: GameObject = MockGameObject.mockStalker();
    const manager: DialogManager = getManager(DialogManager);

    manager.priorityTable.get(EGenericPhraseCategory.JOB).set(object.id(), { told: false } as never);

    callDialogBinding("action_job_dialogs", object, actorGameObject, "dialog", "phrase");

    expect(processPhraseAction).toHaveBeenCalledWith(
      object.id(),
      dialogConfig.PHRASES.get(EGenericPhraseCategory.JOB),
      manager.priorityTable.get(EGenericPhraseCategory.JOB),
      "phrase"
    );
    expect(manager.priorityTable.get(EGenericPhraseCategory.JOB).get(object.id()).told).toBe(true);
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

describe("precondition_information_dialogs_no_more", () => {
  it("should report the information category completion", () => {
    const { actorGameObject } = mockRegisteredActor();
    const manager: DialogManager = getManager(DialogManager);

    jest.spyOn(manager, "isObjectPhraseCategoryTold").mockReturnValue(true);

    expect(callDialogBinding("precondition_information_dialogs_no_more", actorGameObject)).toBe(true);
    expect(manager.isObjectPhraseCategoryTold).toHaveBeenCalledWith(
      actorGameObject.id(),
      EGenericPhraseCategory.INFORMATION
    );
  });
});

describe("precondition_information_dialogs_do_not_know", () => {
  it("should delegate information visibility checks", () => {
    const { actorGameObject } = mockRegisteredActor();

    replaceFunctionMockOnce(shouldHidePhraseCategory, () => true);

    expect(callDialogBinding("precondition_information_dialogs_do_not_know", actorGameObject)).toBe(true);
    expect(shouldHidePhraseCategory).toHaveBeenCalledWith(actorGameObject, EGenericPhraseCategory.INFORMATION);
  });
});

describe("action_information_dialogs", () => {
  it("should process and mark the information category as told", () => {
    const { actorGameObject } = mockRegisteredActor();
    const object: GameObject = MockGameObject.mockStalker();
    const manager: DialogManager = getManager(DialogManager);

    manager.priorityTable.get(EGenericPhraseCategory.INFORMATION).set(object.id(), { told: false } as never);

    callDialogBinding("action_information_dialogs", object, actorGameObject, "dialog", "phrase");

    expect(processPhraseAction).toHaveBeenCalledWith(
      object.id(),
      dialogConfig.PHRASES.get(EGenericPhraseCategory.INFORMATION),
      manager.priorityTable.get(EGenericPhraseCategory.INFORMATION),
      "phrase"
    );
    expect(manager.priorityTable.get(EGenericPhraseCategory.INFORMATION).get(object.id()).told).toBe(true);
  });
});

describe("precondition_information_dialogs", () => {
  it("should delegate information phrase visibility", () => {
    const { actorGameObject } = mockRegisteredActor();
    const object: GameObject = MockGameObject.mockStalker();

    replaceFunctionMockOnce(shouldShowPhrase, () => true);

    expect(
      callDialogBinding("precondition_information_dialogs", object, actorGameObject, "dialog", "parent", "phrase")
    ).toBe(true);
    expect(shouldShowPhrase).toHaveBeenCalledWith(
      object,
      dialogConfig.PHRASES.get(EGenericPhraseCategory.INFORMATION),
      getManager(DialogManager).priorityTable.get(EGenericPhraseCategory.INFORMATION),
      "phrase"
    );
  });
});

describe("precondition_is_phrase_disabled", () => {
  it("should reject phrases disabled for the NPC speaker", () => {
    const { actorGameObject } = mockRegisteredActor();
    const object: GameObject = MockGameObject.mockStalker();
    const manager: DialogManager = getManager(DialogManager);
    const disabled = new LuaTable<string, boolean>();

    expect(
      callDialogBinding("precondition_is_phrase_disabled", actorGameObject, object, "dialog", "parent", "phrase")
    ).toBe(true);

    disabled.set("phrase", true);
    manager.disabledPhrases.set(object.id(), disabled);

    expect(
      callDialogBinding("precondition_is_phrase_disabled", actorGameObject, object, "dialog", "parent", "phrase")
    ).toBe(false);
  });
});

describe("action_disable_phrase", () => {
  it("should correctly disable phrases", () => {
    const { actorGameObject } = mockRegisteredActor();
    const object: GameObject = MockGameObject.mockStalker();
    const manager: DialogManager = getManager(DialogManager);

    jest.spyOn(manager, "disableObjectPhrase").mockImplementation(jest.fn());

    callDialogBinding("action_disable_phrase", actorGameObject, object, "dialog_name", "0");

    expect(manager.disableObjectPhrase).toHaveBeenCalledTimes(1);
    expect(manager.disableObjectPhrase).toHaveBeenCalledWith(object.id(), "dialog_name");
  });
});

describe("create_bye_phrase", () => {
  it("should return one localized actor farewell", () => {
    expect([
      "translated_actor_break_dialog_1",
      "translated_actor_break_dialog_2",
      "translated_actor_break_dialog_3",
    ]).toContain(callDialogBinding<string>("create_bye_phrase"));
  });
});

describe("uni_dialog_precond", () => {
  it("should correctly check dialog preconditions", () => {
    const { actorGameObject } = mockRegisteredActor();
    const object: GameObject = MockGameObject.mockStalker();

    jest.spyOn(object, "character_community").mockImplementation(() => "stalker");
    expect(callDialogBinding("uni_dialog_precond", actorGameObject, object)).toBe(true);

    jest.spyOn(object, "character_community").mockImplementation(() => "bandit");
    expect(callDialogBinding("uni_dialog_precond", actorGameObject, object)).toBe(true);

    jest.spyOn(object, "character_community").mockImplementation(() => "dolg");
    expect(callDialogBinding("uni_dialog_precond", actorGameObject, object)).toBe(true);

    jest.spyOn(object, "character_community").mockImplementation(() => "freedom");
    expect(callDialogBinding("uni_dialog_precond", actorGameObject, object)).toBe(true);

    jest.spyOn(object, "character_community").mockImplementation(() => "zombied");
    expect(callDialogBinding("uni_dialog_precond", actorGameObject, object)).toBe(false);

    jest.spyOn(object, "character_community").mockImplementation(() => "monolith");
    expect(callDialogBinding("uni_dialog_precond", actorGameObject, object)).toBe(false);
  });
});
