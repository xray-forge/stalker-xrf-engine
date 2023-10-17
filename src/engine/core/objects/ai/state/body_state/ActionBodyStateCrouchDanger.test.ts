import { describe, expect, it } from "@jest/globals";
import { anim, move, property_storage } from "xray16";

import { registry } from "@/engine/core/database/registry";
import { registerStalker, unregisterStalker } from "@/engine/core/database/stalker";
import { ActionBodyStateCrouchDanger } from "@/engine/core/objects/ai/state/body_state/ActionBodyStateCrouchDanger";
import { StalkerStateManager } from "@/engine/core/objects/ai/state/StalkerStateManager";
import { StalkerBinder } from "@/engine/core/objects/binders/creature/StalkerBinder";
import { mockGameObject } from "@/fixtures/xray";

describe("ActionBodyStateCrouchDanger class", () => {
  it("should correctly perform body state to crouch danger", () => {
    const stalker: StalkerBinder = new StalkerBinder(mockGameObject());

    registerStalker(stalker);

    stalker.reinit();

    const manager: StalkerStateManager = registry.objects.get(stalker.object.id()).stateManager as StalkerStateManager;
    const action: ActionBodyStateCrouchDanger = new ActionBodyStateCrouchDanger(manager);

    action.setup(stalker.object, new property_storage());

    action.initialize();

    expect(move.crouch).toBe(0);
    expect(anim.danger).toBe(0);
    expect(stalker.object.set_body_state).toHaveBeenCalledWith(move.crouch);
    expect(stalker.object.set_mental_state).toHaveBeenCalledWith(anim.danger);

    unregisterStalker(stalker);
  });
});
