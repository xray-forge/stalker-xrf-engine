import { describe, expect, it } from "@jest/globals";

import { getExternModuleName } from "#/parse/utils/get_extern_module_name";

describe("getExternModuleName", () => {
  it("groups namespaced externs by their public namespace", () => {
    expect(getExternModuleName("xr_conditions.actor_has_item", "conditions")).toBe("xr_conditions");
    expect(getExternModuleName("xr_effects.give_item", "effects")).toBe("xr_effects");
  });

  it("groups global externs by their top-level source module", () => {
    expect(getExternModuleName("on_actor_critical_power", "callbacks")).toBe("callbacks");
  });
});
