/* eslint @typescript-eslint/no-var-requires: 0 */

import { extern } from "@/engine/core/utils/binding";

require("@/engine/scripts/declarations/dialogs/dialogs_pripyat");
require("@/engine/scripts/declarations/dialogs/dialogs_jupiter");

extern("dialogs_zaton", require("@/engine/scripts/declarations/dialogs/dialogs_zaton"));
extern("dialogs", require("@/engine/scripts/declarations/dialogs/dialogs"));
extern("dialog_manager", require("@/engine/scripts/declarations/dialogs/dialog_manager"));
