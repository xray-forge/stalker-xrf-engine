import { describe, expect, it } from "@jest/globals";
import { move, property_storage } from "xray16";

import { ActionMovementStand } from "@/engine/core/objects/ai/state/movement/ActionMovementStand";
import type { StalkerStateManager } from "@/engine/core/objects/ai/state/StalkerStateManager";
import { ClientObject } from "@/engine/lib/types";
import { mockClientGameObject } from "@/fixtures/xray";

describe("ActionMovementStand class", () => {
  it("should correctly perform movement state set", () => {
    const object: ClientObject = mockClientGameObject();
    const action: ActionMovementStand = new ActionMovementStand({} as StalkerStateManager);

    action.setup(object, new property_storage());
    action.initialize();

    expect(object.set_movement_type).toHaveBeenCalledWith(move.stand);

    action.execute();
    expect(object.set_movement_type).toHaveBeenCalledTimes(1);
  });
});
