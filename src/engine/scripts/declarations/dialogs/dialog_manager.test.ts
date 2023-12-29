import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";

import { getManager } from "@/engine/core/database";
import { DialogManager, EGenericPhraseCategory } from "@/engine/core/managers/dialogs";
import { dialogConfig } from "@/engine/core/managers/dialogs/DialogConfig";
import {
  fillPriorityTable,
  initializeNewDialog,
  initializeStartDialogs,
  processPhraseAction,
  shouldHidePhraseCategory,
  shouldShowPhrase,
} from "@/engine/core/managers/dialogs/utils";
import { AnyArgs, AnyObject, GameObject, Optional, PhraseDialog, TName } from "@/engine/lib/types";
import { checkNestedBinding, mockRegisteredActor, resetRegistry } from "@/fixtures/engine";
import { replaceFunctionMockOnce, resetFunctionMock } from "@/fixtures/jest";
import { MockGameObject, MockPhraseDialog } from "@/fixtures/xray";

jest.mock("@/engine/core/managers/dialogs/utils/dialog_action");
jest.mock("@/engine/core/managers/dialogs/utils/dialog_check");
jest.mock("@/engine/core/managers/dialogs/utils/dialog_init");
jest.mock("@/engine/core/managers/dialogs/utils/dialog_priority");

describe("dialogs external callbacks declaration", () => {
  const checkManagerBinding = (name: TName) => checkNestedBinding("dialog_manager", name);

  beforeAll(() => {
    require("@/engine/scripts/declarations/dialogs/dialog_manager");
  });

  it("should correctly inject dialog functors", () => {
    checkManagerBinding("init_new_dialog");
    checkManagerBinding("initialize_start_dialogs");
    checkManagerBinding("init_hello_dialogs");
    checkManagerBinding("action_disable_quest_phrase");
    checkManagerBinding("action_anomalies_dialogs");
    checkManagerBinding("action_job_dialogs");
    checkManagerBinding("action_hello_dialogs");
    checkManagerBinding("fill_priority_hello_table");
    checkManagerBinding("fill_priority_job_table");
    checkManagerBinding("fill_priority_anomalies_table");
    checkManagerBinding("fill_priority_information_table");
    checkManagerBinding("precondition_hello_dialogs");
    checkManagerBinding("precondition_job_dialogs_no_more");
    checkManagerBinding("precondition_job_dialogs_do_not_know");
    checkManagerBinding("precondition_job_dialogs");
    checkManagerBinding("precondition_anomalies_dialogs_no_more");
    checkManagerBinding("precondition_information_dialogs_no_more");
    checkManagerBinding("precondition_information_dialogs_do_not_know");
    checkManagerBinding("action_information_dialogs");
    checkManagerBinding("precondition_information_dialogs");
    checkManagerBinding("precondition_is_phrase_disabled");
    checkManagerBinding("action_disable_phrase");
    checkManagerBinding("create_bye_phrase");
    checkManagerBinding("uni_dialog_precond");
  });
});

describe("dialogs external callbacks implementation", () => {
  function callDialogBinding<T = void>(name: TName, ...parameters: AnyArgs): T {
    const effects: Optional<AnyObject> = (_G as AnyObject)["dialog_manager"];

    if (effects && name in effects) {
      return (_G as AnyObject)["dialog_manager"][name](...parameters);
    } else if (!effects) {
      throw new Error("Unexpected call - 'dialog_manager' global is not registered.");
    } else {
      throw new Error(`Unexpected method provided - '${name}', no matching methods in dialog_manager globals.`);
    }
  }

  beforeAll(() => {
    require("@/engine/scripts/declarations/dialogs/dialog_manager");
  });

  beforeEach(() => {
    resetRegistry();

    resetFunctionMock(fillPriorityTable);
    resetFunctionMock(initializeNewDialog);
    resetFunctionMock(initializeStartDialogs);
    resetFunctionMock(processPhraseAction);
    resetFunctionMock(shouldHidePhraseCategory);
    resetFunctionMock(shouldShowPhrase);
  });

  it("init_new_dialog should initialize correctly", () => {
    const dialog: PhraseDialog = MockPhraseDialog.mock();

    callDialogBinding("init_new_dialog", dialog);

    expect(initializeNewDialog).toHaveBeenCalledTimes(1);
    expect(initializeNewDialog).toHaveBeenCalledWith(dialog);
  });

  it("initialize_start_dialogs should initialize correctly", () => {
    const dialog: PhraseDialog = MockPhraseDialog.mock();

    callDialogBinding("initialize_start_dialogs", dialog, EGenericPhraseCategory.JOB);

    expect(initializeStartDialogs).toHaveBeenCalledTimes(1);
    expect(initializeStartDialogs).toHaveBeenCalledWith(dialog, EGenericPhraseCategory.JOB);
  });

  it("init_hello_dialogs should initialize correctly", () => {
    const dialog: PhraseDialog = MockPhraseDialog.mock();

    callDialogBinding("init_hello_dialogs", dialog);

    expect(initializeStartDialogs).toHaveBeenCalledTimes(1);
    expect(initializeStartDialogs).toHaveBeenCalledWith(dialog, EGenericPhraseCategory.HELLO);
  });

  it("fill_priority_hello_table should correctly handle priorities", () => {
    const { actorGameObject } = mockRegisteredActor();
    const object: GameObject = MockGameObject.mockStalker();

    callDialogBinding("fill_priority_hello_table", actorGameObject, object);

    expect(fillPriorityTable).toHaveBeenCalledTimes(1);
    expect(fillPriorityTable).toHaveBeenCalledWith(
      object,
      dialogConfig.PHRASES.get(EGenericPhraseCategory.HELLO),
      getManager(DialogManager).priorityTable.get(EGenericPhraseCategory.HELLO)
    );
  });

  it("fill_priority_job_table should correctly handle priorities", () => {
    const { actorGameObject } = mockRegisteredActor();
    const object: GameObject = MockGameObject.mockStalker();

    callDialogBinding("fill_priority_job_table", actorGameObject, object);

    expect(fillPriorityTable).toHaveBeenCalledTimes(1);
    expect(fillPriorityTable).toHaveBeenCalledWith(
      object,
      dialogConfig.PHRASES.get(EGenericPhraseCategory.JOB),
      getManager(DialogManager).priorityTable.get(EGenericPhraseCategory.JOB)
    );
  });

  it("fill_priority_anomalies_table should correctly handle priorities", () => {
    const { actorGameObject } = mockRegisteredActor();
    const object: GameObject = MockGameObject.mockStalker();

    callDialogBinding("fill_priority_anomalies_table", actorGameObject, object);

    expect(fillPriorityTable).toHaveBeenCalledTimes(1);
    expect(fillPriorityTable).toHaveBeenCalledWith(
      object,
      dialogConfig.PHRASES.get(EGenericPhraseCategory.ANOMALIES),
      getManager(DialogManager).priorityTable.get(EGenericPhraseCategory.ANOMALIES)
    );
  });

  it("fill_priority_information_table should correctly handle priorities", () => {
    const { actorGameObject } = mockRegisteredActor();
    const object: GameObject = MockGameObject.mockStalker();

    callDialogBinding("fill_priority_information_table", actorGameObject, object);

    expect(fillPriorityTable).toHaveBeenCalledTimes(1);
    expect(fillPriorityTable).toHaveBeenCalledWith(
      object,
      dialogConfig.PHRASES.get(EGenericPhraseCategory.INFORMATION),
      getManager(DialogManager).priorityTable.get(EGenericPhraseCategory.INFORMATION)
    );
  });

  it("precondition_hello_dialogs should correctly check preconditions", () => {
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

  it("action_hello_dialogs should correctly switch", () => {
    const { actorGameObject } = mockRegisteredActor();
    const object: GameObject = MockGameObject.mockStalker();

    callDialogBinding("action_hello_dialogs", actorGameObject, object, "dialog_name", "parent_id");

    expect(processPhraseAction).toHaveBeenCalledTimes(1);
    expect(processPhraseAction).toHaveBeenCalledWith(
      actorGameObject,
      dialogConfig.PHRASES.get(EGenericPhraseCategory.HELLO),
      getManager(DialogManager).priorityTable.get(EGenericPhraseCategory.HELLO),
      "parent_id"
    );
  });

  it("precondition_job_dialogs_no_more should correctly check preconditions", () => {
    const { actorGameObject } = mockRegisteredActor();
    const manager: DialogManager = getManager(DialogManager);

    jest.spyOn(manager, "isObjectPhraseCategoryTold").mockImplementationOnce(() => true);

    replaceFunctionMockOnce(shouldShowPhrase, () => true);

    expect(callDialogBinding("precondition_job_dialogs_no_more", actorGameObject)).toBe(true);

    expect(manager.isObjectPhraseCategoryTold).toHaveBeenCalledTimes(1);
    expect(manager.isObjectPhraseCategoryTold).toHaveBeenCalledWith(actorGameObject.id(), EGenericPhraseCategory.JOB);
  });

  it("precondition_job_dialogs_do_not_know should correctly check preconditions", () => {
    const { actorGameObject } = mockRegisteredActor();

    replaceFunctionMockOnce(shouldHidePhraseCategory, () => true);

    expect(callDialogBinding("precondition_job_dialogs_do_not_know", actorGameObject)).toBe(true);

    expect(shouldHidePhraseCategory).toHaveBeenCalledTimes(1);
    expect(shouldHidePhraseCategory).toHaveBeenCalledWith(actorGameObject, EGenericPhraseCategory.JOB);
  });

  it("precondition_job_dialogs should correctly check preconditions", () => {
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

  it.todo("action_anomalies_dialogs should correctly switch");

  it.todo("action_job_dialogs should correctly switch");

  it.todo("precondition_anomalies_dialogs_no_more should correctly check preconditions");

  it.todo("precondition_information_dialogs_no_more should correctly check preconditions");

  it.todo("precondition_information_dialogs_do_not_know should correctly check preconditions");

  it.todo("action_information_dialogs should correctly switch");

  it.todo("precondition_information_dialogs should correctly check preconditions");

  it.todo("precondition_is_phrase_disabled should correctly check preconditions");

  it.todo("action_disable_phrase should correctly disable phrases");

  it.todo("create_bye_phrase should correctly create bye option");

  it("uni_dialog_precond should correctly check dialog preconditions", () => {
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
