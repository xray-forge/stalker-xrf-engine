import { beforeAll, describe, it } from "@jest/globals";

import { TName } from "@/engine/lib/types";
import { checkNestedBinding } from "@/fixtures/engine";

describe("dialogs external callbacks", () => {
  const checkManagerBinding = (name: TName) => checkNestedBinding("dialog_manager", name);

  beforeAll(() => {
    require("@/engine/scripts/declarations/dialogs/dialog_manager");
  });

  it("should correctly inject dialog functors", () => {
    checkManagerBinding("init_new_dialog");
    checkManagerBinding("initializeStartDialogs");
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
