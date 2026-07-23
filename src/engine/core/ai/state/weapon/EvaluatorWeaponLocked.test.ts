import { describe, expect, it } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject, MockPropertyStorage } from "xray16/mocks";

import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";
import { EvaluatorWeaponLocked } from "@/engine/core/ai/state/weapon/EvaluatorWeaponLocked";

describe("EvaluatorWeaponLocked", () => {
  it("reports the object weapon-lock predicate", () => {
    const object: GameObject = MockGameObject.mock();
    const evaluator = new EvaluatorWeaponLocked(new StalkerStateController(object));

    evaluator.setup(object, MockPropertyStorage.mock());
    expect(evaluator.evaluate()).toBe(false);
  });
});
