import { describe, expect, it, jest } from "@jest/globals";

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
import { giveWoundedObjectMedkit } from "@/engine/core/utils/object";
import { EScheme, GameObject, Optional } from "@/engine/lib/types";
import { mockSchemeState } from "@/fixtures/engine";
import { MockGameObject } from "@/fixtures/xray";

jest.mock("@/engine/core/utils/object");

describe("finishObjectHelpWounded", () => {
  it("should correctly give medkit and unlock it", () => {
    const first: GameObject = MockGameObject.mock();
    const second: GameObject = MockGameObject.mock();
    const firstState: IRegistryObjectState = registerObject(first);
    const secondState: IRegistryObjectState = registerObject(second);

    firstState[EScheme.HELP_WOUNDED] = mockSchemeState<ISchemeHelpWoundedState>(EScheme.HELP_WOUNDED, {
      selectedWoundedId: second.id(),
    });
    secondState[EScheme.WOUNDED] = mockSchemeState<ISchemeWoundedState>(EScheme.HELP_WOUNDED, {
      woundManager: { unlockMedkit: jest.fn() } as unknown as WoundManager,
    });

    finishObjectHelpWounded(first);

    expect(giveWoundedObjectMedkit).toHaveBeenCalledWith(second);
    expect(
      (secondState[EScheme.WOUNDED] as Optional<ISchemeWoundedState>)?.woundManager.unlockMedkit
    ).toHaveBeenCalled();
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
