import { beforeEach, describe, expect, it } from "@jest/globals";

import { registerSimulator, registry } from "@/engine/core/database";
import { setStableAlifeObjectsUpdate, setUnlimitedAlifeObjectsUpdate } from "@/engine/core/utils/alife";
import { MAX_ALIFE_ID } from "@/engine/lib/constants/memory";
import { resetFunctionMock } from "@/fixtures/jest";

describe("setUnlimitedAlifeObjectsUpdate util", () => {
  beforeEach(() => registerSimulator());

  it("setUnlimitedAlifeObjectsUpdate should correctly set high updates limits", () => {
    resetFunctionMock(registry.simulator.set_objects_per_update);
    setUnlimitedAlifeObjectsUpdate();

    expect(registry.simulator.set_objects_per_update).toHaveBeenCalledWith(MAX_ALIFE_ID);
  });
});

describe("setStableAlifeObjectsUpdate util", () => {
  beforeEach(() => registerSimulator());

  it("setStableAlifeObjectsUpdate should correctly set high updates limits", () => {
    resetFunctionMock(registry.simulator.set_objects_per_update);
    setStableAlifeObjectsUpdate();

    expect(registry.simulator.set_objects_per_update).toHaveBeenCalledWith(20);
  });
});
