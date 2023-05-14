import { describe, expect, it } from "@jest/globals";
import { move, property_storage } from "xray16";

import { registry } from "@/engine/core/database/registry";
import { registerStalker, unregisterStalker } from "@/engine/core/database/stalker";
import { StalkerBinder } from "@/engine/core/objects";
import { ActionBodyStateCrouch } from "@/engine/core/objects/state/body_state/ActionBodyStateCrouch";
import { ActionBodyStateStanding } from "@/engine/core/objects/state/body_state/ActionBodyStateStanding";
import { StalkerStateManager } from "@/engine/core/objects/state/StalkerStateManager";
import { mockClientGameObject } from "@/fixtures/xray";

describe("ActionBodyStateStanding class", () => {
  it("should correctly perform body state change to standing", () => {
    const stalker: StalkerBinder = new StalkerBinder(mockClientGameObject());

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
