import { describe, expect, it } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject, MockPropertyStorage } from "xray16/mocks";

import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";
import { EvaluatorWeaponStrappedNow } from "@/engine/core/ai/state/weapon/EvaluatorWeaponStrappedNow";

describe("EvaluatorWeaponStrappedNow", () => {
  it("treats objects without a weapon as already strapped", () => {
    const object: GameObject = MockGameObject.mock();
    const evaluator = new EvaluatorWeaponStrappedNow(new StalkerStateController(object));

    evaluator.setup(object, MockPropertyStorage.mock());
    expect(evaluator.evaluate()).toBe(true);
  });
});
