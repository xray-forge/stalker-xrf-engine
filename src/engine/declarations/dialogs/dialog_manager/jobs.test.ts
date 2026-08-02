import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { AnyArgs, AnyObject, Nillable, TName } from "xray16/lib";
import { MockGameObject } from "xray16/mocks";
import { replaceFunctionMockOnce, resetFunctionMock } from "xray16/testing/utils";

import { getManager } from "@/engine/core/database";
import { DialogManager, EGenericPhraseCategory } from "@/engine/core/managers/dialogs";
import { dialogConfig } from "@/engine/core/managers/dialogs/DialogConfig";
import { processPhraseAction, shouldHidePhraseCategory, shouldShowPhrase } from "@/engine/core/managers/dialogs/utils";
import { mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

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

beforeAll(() => {
  require("@/engine/declarations/dialogs/dialog_manager/jobs");
});

beforeEach(() => {
  resetRegistry();

  resetFunctionMock(processPhraseAction);
  resetFunctionMock(shouldHidePhraseCategory);
  resetFunctionMock(shouldShowPhrase);
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
