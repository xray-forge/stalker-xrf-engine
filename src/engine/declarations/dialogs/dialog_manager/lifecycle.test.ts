import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { PhraseDialog } from "xray16/alias";
import { AnyArgs, AnyObject, Nillable, TName } from "xray16/lib";
import { MockPhraseDialog } from "xray16/mocks";
import { resetFunctionMock } from "xray16/testing/utils";

import { EGenericPhraseCategory } from "@/engine/core/managers/dialogs";
import { initializeCategoryDialogs, initializeNewDialog } from "@/engine/core/managers/dialogs/utils";
import { resetRegistry } from "@/fixtures/engine";

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

jest.mock("@/engine/core/managers/dialogs/utils/dialog_init");

beforeAll(() => {
  require("@/engine/declarations/dialogs/dialog_manager/lifecycle");
});

beforeEach(() => {
  resetRegistry();

  resetFunctionMock(initializeNewDialog);
  resetFunctionMock(initializeCategoryDialogs);
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
