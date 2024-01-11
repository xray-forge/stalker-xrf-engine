import { beforeEach, describe, expect, it } from "@jest/globals";
import { move } from "xray16";

import { StalkerStateManager } from "@/engine/core/ai/state";
import { ActionSmartCoverEnter } from "@/engine/core/ai/state/smart_cover/ActionSmartCoverEnter";
import { IRegistryObjectState, registerObject } from "@/engine/core/database";
import { ISchemeSmartCoverState } from "@/engine/core/schemes/stalker/smartcover";
import { EScheme, GameObject } from "@/engine/lib/types";
import { mockSchemeState, resetRegistry } from "@/fixtures/engine";
import { MockGameObject, MockPropertyStorage } from "@/fixtures/xray";

describe("ActionSmartCoverEnter class", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should correctly perform enter smart cover action", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);
    const stateManager: StalkerStateManager = new StalkerStateManager(object);
    const action: ActionSmartCoverEnter = new ActionSmartCoverEnter(stateManager);

    state[EScheme.SMARTCOVER] = mockSchemeState<ISchemeSmartCoverState>(EScheme.SMARTCOVER, {
      coverName: "test-cover-name",
      loopholeName: "test-loophole-name",
    });

    action.setup(object, MockPropertyStorage.mock());
    action.initialize();

    expect(object.use_smart_covers_only).toHaveBeenCalledWith(true);
    expect(object.set_movement_type).toHaveBeenCalledWith(move.run);
    expect(object.set_dest_smart_cover).toHaveBeenCalledWith("test-cover-name");
    expect(object.set_dest_loophole).toHaveBeenCalledWith("test-loophole-name");
  });

  it("should correctly perform enter smart cover action without loopholes", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);
    const stateManager: StalkerStateManager = new StalkerStateManager(object);
    const action: ActionSmartCoverEnter = new ActionSmartCoverEnter(stateManager);

    state[EScheme.SMARTCOVER] = mockSchemeState<ISchemeSmartCoverState>(EScheme.SMARTCOVER, {
      coverName: "test-cover-name",
    });

    action.setup(object, MockPropertyStorage.mock());
    action.initialize();

    expect(object.use_smart_covers_only).toHaveBeenCalledWith(true);
    expect(object.set_movement_type).toHaveBeenCalledWith(move.run);
    expect(object.set_dest_smart_cover).toHaveBeenCalledWith("test-cover-name");
    expect(object.set_dest_loophole).not.toHaveBeenCalled();
  });
});
