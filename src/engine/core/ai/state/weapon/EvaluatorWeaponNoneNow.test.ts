import { describe, expect, it } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject, MockPropertyStorage } from "xray16/mocks";

import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";
import { EvaluatorWeaponNoneNow } from "@/engine/core/ai/state/weapon/EvaluatorWeaponNoneNow";

describe("EvaluatorWeaponNoneNow", () => {
  it("reports no weapon for an object without an active item", () => {
    const object: GameObject = MockGameObject.mock();
    const evaluator = new EvaluatorWeaponNoneNow(new StalkerStateController(object));

    evaluator.setup(object, MockPropertyStorage.mock());
    expect(evaluator.evaluate()).toBe(true);
  });
});
