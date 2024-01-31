import { describe, expect, it } from "@jest/globals";
import { move, property_storage } from "xray16";

import { ActionBodyStateStanding } from "@/engine/core/ai/state/body_state/ActionBodyStateStanding";
import { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";
import { StalkerBinder } from "@/engine/core/binders/creature/StalkerBinder";
import { registry } from "@/engine/core/database/registry";
import { registerStalker, unregisterStalker } from "@/engine/core/database/stalker";
import { MockGameObject } from "@/fixtures/xray";

describe("ActionBodyStateStanding", () => {
  it("should correctly perform body state change to standing", () => {
    const stalker: StalkerBinder = new StalkerBinder(MockGameObject.mock());

    registerStalker(stalker);

    stalker.reinit();

    const manager: StalkerStateManager = registry.objects.get(stalker.object.id()).stateManager as StalkerStateManager;
    const action: ActionBodyStateStanding = new ActionBodyStateStanding(manager);

    action.setup(stalker.object, new property_storage());

    action.initialize();

    expect(move.standing).toBe(1);
    expect(stalker.object.set_body_state).toHaveBeenCalledWith(move.standing);

    unregisterStalker(stalker);
  });
});
