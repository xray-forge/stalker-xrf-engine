import { abort, extern, getExtern } from "xray16/lib";

import { discoverDeclarationModules, loadDeclarationModules } from "@/engine/scripts/register/declaration_modules";

/**
 * Register global scope variables used in x-ray engine, globally or withing game config scripts.
 */
export function registerExternals(): void {
  // Do not register externals over and over on every scope access.
  if (getExtern("areExternalsRegistered")) {
    return;
  }

  if (getExtern("areExternalsRegistering")) {
    return abort("Recursive externals registration detected");
  }

  extern("areExternalsRegistering", true);

  try {
    // Direct writes bypass `_G.__index` autoloader and shadow the matching vanilla script namespaces.
    extern("engine", {});

    extern("xr_conditions", {});
    extern("xr_effects", {});

    extern("dialog_manager", {});
    extern("dialogs", {});
    extern("dialogs_jupiter", {});
    extern("dialogs_pripyat", {});
    extern("dialogs_zaton", {});
    extern("task_functors", {});

    const modules = discoverDeclarationModules();

    if (modules.length() === 0) {
      return abort("No declaration payload modules found in $game_data$/declarations");
    }

    loadDeclarationModules(modules);

    extern("areExternalsRegistered", true);
  } finally {
    extern("areExternalsRegistering", false);
  }
}
