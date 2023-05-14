import { describe, expect, it } from "@jest/globals";
import { property_storage } from "xray16";

import { registry } from "@/engine/core/database/registry";
import { registerStalker, setStalkerState, unregisterStalker } from "@/engine/core/database/stalker";
import { StalkerBinder } from "@/engine/core/objects";
import { EStalkerState } from "@/engine/core/objects/state";
import { EvaluatorBodyStateStanding } from "@/engine/core/objects/state/body_state/EvaluatorBodyStateStanding";
import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import { mockClientGameObject } from "@/fixtures/xray";

describe("EvaluatorBodyStateStanding class", () => {
  it("should correctly evaluate standing now", () => {
    const stalker: StalkerBinder = new StalkerBinder(mockClientGameObject());

    registerStalker(stalker);

    stalker.reinit();

    const manager: StalkerStateManager = registry.objects.get(stalker.object.id()).stateManager as StalkerStateManager;
    const evaluator: EvaluatorBodyStateStanding = new EvaluatorBodyStateStanding(manager);

    evaluator.setup(stalker.object, new property_storage());
    expect(evaluator.evaluate()).toBeFalsy();

    setStalkerState(stalker.object, EStalkerState.RAID_FIRE);
    expect(evaluator.evaluate()).toBeTruthy();

    setStalkerState(stalker.object, EStalkerState.SNEAK);
    expect(evaluator.evaluate()).toBeFalsy();

    unregisterStalker(stalker);
  });
});
