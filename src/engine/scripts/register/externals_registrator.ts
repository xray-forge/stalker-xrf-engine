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

  require("@/engine/scripts/declarations/callbacks");
  require("@/engine/scripts/declarations/conditions");
  require("@/engine/scripts/declarations/effects");
  require("@/engine/scripts/declarations/tasks");
  require("@/engine/scripts/declarations/dialogs");
}
