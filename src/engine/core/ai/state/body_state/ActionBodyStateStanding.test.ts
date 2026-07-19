import { describe, expect, it } from "@jest/globals";
import { move, property_storage } from "xray16";
import { MockGameObject } from "xray16/mocks";

import { ActionBodyStateStanding } from "@/engine/core/ai/state/body_state/ActionBodyStateStanding";
import { StalkerStateController } from "@/engine/core/ai/state/StalkerStateController";
import { StalkerBinder } from "@/engine/core/binders/creature/StalkerBinder";
import { registry } from "@/engine/core/database/registry";
import { registerStalker, unregisterStalker } from "@/engine/core/database/stalker";

describe("ActionBodyStateStanding", () => {
  it("should correctly perform body state change to standing", () => {
    const stalker: StalkerBinder = new StalkerBinder(MockGameObject.mock());

    registerStalker(stalker);

    stalker.reinit();

    const controller: StalkerStateController = registry.objects.get(stalker.object.id())
      .stateController as StalkerStateController;
    const action: ActionBodyStateStanding = new ActionBodyStateStanding(controller);

    action.setup(stalker.object, new property_storage());

    action.initialize();

    expect(move.standing).toBe(1);
    expect(stalker.object.set_body_state).toHaveBeenCalledWith(move.standing);

    unregisterStalker(stalker);
  });
});
