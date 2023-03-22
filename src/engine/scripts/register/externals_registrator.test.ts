import { describe, expect, it } from "@jest/globals";

import { getExtern } from "@/engine/core/utils/binding";
import { registerExternals } from "@/engine/scripts/register/externals_registrator";

describe("'extrnals_registrator' entry point", () => {
  it("'registerExternals' should correctly register globals and mark as called", () => {
    expect(getExtern("areExternalsRegistered")).toBeFalsy();

    registerExternals();

    expect(getExtern("areExternalsRegistered")).toBeTruthy();

    expect(getExtern("engine")).toBeDefined();

    expect(getExtern("xr_conditions")).toBeDefined();
    expect(getExtern("xr_effects")).toBeDefined();

    expect(getExtern("dialogs")).toBeDefined();
    expect(getExtern("dialog_manager")).toBeDefined();
    expect(getExtern("dialogs_pripyat")).toBeDefined();
    expect(getExtern("dialogs_jupiter")).toBeDefined();
    expect(getExtern("dialogs_zaton")).toBeDefined();
  });
});
