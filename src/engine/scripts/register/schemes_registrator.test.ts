import { describe, it } from "@jest/globals";
import { NIL } from "xray16/lib";

import { registry } from "@/engine/core/database";
import { EScheme } from "@/engine/core/schemes/types";
import { registerSchemes } from "@/engine/scripts/register/schemes_registrator";

describe("schemes_registrator entry point", () => {
  it("registerSchemes should correctly register all schemes", () => {
    registerSchemes();

    Object.entries(EScheme).forEach(([_, value]) => {
      if (value !== NIL && !registry.schemes.has(value)) {
        throw new Error(`Expected all schemes to be registered, but ${value} is not in registry.`);
      }
    });
  });
});
