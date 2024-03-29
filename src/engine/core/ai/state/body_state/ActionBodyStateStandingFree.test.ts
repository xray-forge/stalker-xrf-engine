import { describe, expect, it } from "@jest/globals";
import { anim, move, property_storage } from "xray16";

import { ActionBodyStateStandingFree } from "@/engine/core/ai/state/body_state/ActionBodyStateStandingFree";
import { StalkerStateManager } from "@/engine/core/ai/state/StalkerStateManager";
import { StalkerBinder } from "@/engine/core/binders/creature/StalkerBinder";
import { registry } from "@/engine/core/database/registry";
import { registerStalker, unregisterStalker } from "@/engine/core/database/stalker";
import { MockGameObject } from "@/fixtures/xray";

describe("ActionBodyStateStandingFree", () => {
  it("should correctly perform body state change to standing free", () => {
    const stalker: StalkerBinder = new StalkerBinder(MockGameObject.mock());

    registerStalker(stalker);

    stalker.reinit();

    const manager: StalkerStateManager = registry.objects.get(stalker.object.id()).stateManager as StalkerStateManager;
    const action: ActionBodyStateStandingFree = new ActionBodyStateStandingFree(manager);

    action.setup(stalker.object, new property_storage());

    action.initialize();

    expect(move.standing).toBe(1);
    expect(anim.free).toBe(1);
    expect(stalker.object.set_body_state).toHaveBeenCalledWith(move.standing);
    expect(stalker.object.set_mental_state).toHaveBeenCalledWith(anim.free);

    unregisterStalker(stalker);
  });
});
