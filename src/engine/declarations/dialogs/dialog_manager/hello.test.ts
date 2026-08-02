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
  require("@/engine/declarations/dialogs/dialog_manager/hello");
});

beforeEach(() => {
  resetRegistry();

  resetFunctionMock(processPhraseAction);
  resetFunctionMock(shouldHidePhraseCategory);
  resetFunctionMock(shouldShowPhrase);
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
