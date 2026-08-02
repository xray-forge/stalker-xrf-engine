import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { AnyArgs, AnyObject, Nillable, TName } from "xray16/lib";
import { MockGameObject } from "xray16/mocks";
import { resetFunctionMock } from "xray16/testing/utils";

import { getManager } from "@/engine/core/database";
import { DialogManager, EGenericPhraseCategory } from "@/engine/core/managers/dialogs";
import { dialogConfig } from "@/engine/core/managers/dialogs/DialogConfig";
import { fillPhrasesPriorities } from "@/engine/core/managers/dialogs/utils";
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

jest.mock("@/engine/core/managers/dialogs/utils/dialog_priority");

beforeAll(() => {
  require("@/engine/declarations/dialogs/dialog_manager/priority_tables");
});

beforeEach(() => {
  resetRegistry();

  resetFunctionMock(fillPhrasesPriorities);
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
