/* eslint @typescript-eslint/no-var-requires: 0 */

import { extern, getExtern } from "@/engine/core/utils/binding";

/**
 * Register global scope variables used in x-ray engine, globally or withing game config scripts.
 */
export function registerExternals(): void {
  // Do not register externals over and over on every scope access.
  if (getExtern("areExternalsRegistered")) {
    return;
  } else {
    extern("areExternalsRegistered", true);
  }

  extern("dialogs_pripyat", require("@/engine/scripts/declarations/dialogs/dialogs_pripyat"));
  extern("dialogs_jupiter", require("@/engine/scripts/declarations/dialogs/dialogs_jupiter"));
  extern("dialogs_zaton", require("@/engine/scripts/declarations/dialogs/dialogs_zaton"));
  extern("dialogs", require("@/engine/scripts/declarations/dialogs/dialogs"));
  extern("dialog_manager", require("@/engine/scripts/declarations/dialogs/dialog_manager"));

  extern("xr_conditions", require("@/engine/scripts/declarations/conditions/conditions"));
  extern("xr_effects", require("@/engine/scripts/declarations/effects/effects"));
  extern("functors", require("@/engine/scripts/declarations/functors/functors"));

  require("@/engine/scripts/declarations/callbacks/index");
}
