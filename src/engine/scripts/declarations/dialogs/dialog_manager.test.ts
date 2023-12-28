import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";

import { AnyArgs, AnyObject, GameObject, Optional, TName } from "@/engine/lib/types";
import { checkNestedBinding, mockRegisteredActor, resetRegistry } from "@/fixtures/engine";
import { MockGameObject } from "@/fixtures/xray";

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
  function callDialogBinding<T = void>(name: TName, actor: GameObject, object: GameObject, ...parameters: AnyArgs): T {
    const effects: Optional<AnyObject> = (_G as AnyObject)["dialog_manager"];

    if (effects && name in effects) {
      return (_G as AnyObject)["dialog_manager"][name](actor, object, parameters);
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
  });

  it.todo("init_new_dialog should initialize correctly");

  it.todo("initialize_start_dialogs should initialize correctly");

  it.todo("init_hello_dialogs should initialize correctly");

  it.todo("action_disable_quest_phrase should disable phrases");

  it.todo("action_anomalies_dialogs should correctly switch");

  it.todo("action_job_dialogs should correctly switch");

  it.todo("action_hello_dialogs should correctly switch");

  it.todo("fill_priority_hello_table should correctly handle priorities");

  it.todo("fill_priority_job_table should correctly handle priorities");

  it.todo("fill_priority_anomalies_table should correctly handle priorities");

  it.todo("fill_priority_information_table should correctly handle priorities");

  it.todo("precondition_hello_dialogs should correctly check preconditions");

  it.todo("precondition_job_dialogs_no_more should correctly check preconditions");

  it.todo("precondition_job_dialogs_do_not_know should correctly check preconditions");

  it.todo("precondition_job_dialogs should correctly check preconditions");

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
