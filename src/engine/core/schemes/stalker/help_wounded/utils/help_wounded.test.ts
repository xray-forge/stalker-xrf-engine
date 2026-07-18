import { describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import {
  getPortableStoreValue,
  IRegistryObjectState,
  registerObject,
  setPortableStoreValue,
} from "@/engine/core/database";
import {
  finishObjectHelpWounded,
  freeSelectedWoundedStalkerSpot,
  ISchemeHelpWoundedState,
} from "@/engine/core/schemes/stalker/help_wounded";
import { helpWoundedConfig } from "@/engine/core/schemes/stalker/help_wounded/HelpWoundedConfig";
import { ISchemeWoundedState } from "@/engine/core/schemes/stalker/wounded";
import { WoundManager } from "@/engine/core/schemes/stalker/wounded/WoundManager";
import { getSchemeStateOptimistic, setSchemeState } from "@/engine/core/schemes/state";
import { EScheme } from "@/engine/core/schemes/types";
import { giveWoundedObjectMedkit } from "@/engine/core/utils/object";
import { mockSchemeState } from "@/fixtures/engine";

jest.mock("@/engine/core/utils/object");

describe("finishObjectHelpWounded", () => {
  it("should correctly give medkit and unlock it", () => {
    const first: GameObject = MockGameObject.mock();
    const second: GameObject = MockGameObject.mock();
    const firstState: IRegistryObjectState = registerObject(first);
    const secondState: IRegistryObjectState = registerObject(second);

    setSchemeState(
      firstState,
      EScheme.HELP_WOUNDED,
      mockSchemeState<ISchemeHelpWoundedState>(EScheme.HELP_WOUNDED, {
        selectedWoundedId: second.id(),
      })
    );
    setSchemeState(
      secondState,
      EScheme.WOUNDED,
      mockSchemeState<ISchemeWoundedState>(EScheme.WOUNDED, {
        woundManager: { unlockMedkit: jest.fn() } as unknown as WoundManager,
      })
    );

    finishObjectHelpWounded(first);

    expect(giveWoundedObjectMedkit).toHaveBeenCalledWith(second);
    expect(getSchemeStateOptimistic(secondState, EScheme.WOUNDED).woundManager.unlockMedkit).toHaveBeenCalled();
  });
});

describe("freeSelectedWoundedStalkerSpot", () => {
  it("should correctly update portable store", () => {
    const object: GameObject = MockGameObject.mock();

    registerObject(object);

    expect(() => freeSelectedWoundedStalkerSpot(null)).not.toThrow();

    setPortableStoreValue(object.id(), helpWoundedConfig.HELPING_WOUNDED_OBJECT_KEY, 10);
    freeSelectedWoundedStalkerSpot(object.id());

    expect(getPortableStoreValue(object.id(), helpWoundedConfig.HELPING_WOUNDED_OBJECT_KEY)).toBeNull();
  });
});
