import { describe, it } from "@jest/globals";

import { registry } from "@/engine/core/database";
import { NIL } from "@/engine/lib/constants/words";
import { EScheme } from "@/engine/lib/types";
import { registerSchemeModules } from "@/engine/scripts/register/schemes_registrator";

describe("'schemes_registrator' entry point", () => {
  it("'registerSchemeModules' should correctly register all schemes", () => {
    registerSchemeModules();

    Object.entries(EScheme).forEach(([key, value]) => {
      if (value !== NIL && !registry.schemes.has(value)) {
        throw new Error(`Expected all schemes to be registered, but '${value}' is not in registry.`);
      }
    });
  });
});
