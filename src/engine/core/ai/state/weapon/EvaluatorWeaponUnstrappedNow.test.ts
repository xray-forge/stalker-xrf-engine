import { describe, expect, it } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject, MockPropertyStorage } from "xray16/mocks";

import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";
import { EvaluatorWeaponUnstrappedNow } from "@/engine/core/ai/state/weapon/EvaluatorWeaponUnstrappedNow";

describe("EvaluatorWeaponUnstrappedNow", () => {
  it("does not report unstrapped state without an active weapon", () => {
    const object: GameObject = MockGameObject.mock();
    const evaluator = new EvaluatorWeaponUnstrappedNow(new StalkerStateController(object));

    evaluator.setup(object, MockPropertyStorage.mock());
    expect(evaluator.evaluate()).toBe(false);
  });
});
