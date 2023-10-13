import { beforeEach, describe, expect, it } from "@jest/globals";

import { registerSimulator, registry } from "@/engine/core/database";
import { setStableAlifeObjectsUpdate, setUnlimitedAlifeObjectsUpdate } from "@/engine/core/utils/alife";
import { resetFunctionMock } from "@/fixtures/jest";

describe("alife utils", () => {
  beforeEach(() => registerSimulator());

  it("setUnlimitedAlifeObjectsUpdate should correctly set high updates limits", () => {
    resetFunctionMock(registry.simulator.set_objects_per_update);
    setUnlimitedAlifeObjectsUpdate();

    expect(registry.simulator.set_objects_per_update).toHaveBeenCalledWith(65_535);
  });

  it("setStableAlifeObjectsUpdate should correctly set high updates limits", () => {
    resetFunctionMock(registry.simulator.set_objects_per_update);
    setStableAlifeObjectsUpdate();

    expect(registry.simulator.set_objects_per_update).toHaveBeenCalledWith(20);
  });
});
