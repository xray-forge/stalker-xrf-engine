import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { hit } from "xray16";

import { IRegistryObjectState, registerObject, registerSimulator, registry } from "@/engine/core/database";
import { ISchemeWoundedState } from "@/engine/core/schemes/stalker/wounded";
import { WoundManager } from "@/engine/core/schemes/stalker/wounded/WoundManager";
import {
  enableObjectWoundedHealing,
  giveWoundedObjectMedkit,
  isObjectPsyWounded,
  setObjectWounded,
} from "@/engine/core/utils/object/object_wounds";
import { EScheme, GameObject, Hit, Optional } from "@/engine/lib/types";
import { mockSchemeState } from "@/fixtures/engine";
import { MockGameObject } from "@/fixtures/xray";
import { MockVector } from "@/fixtures/xray/mocks/vector.mock";

describe("giveWoundedObjectMedkit util", () => {
  beforeEach(() => {
    registerSimulator();
  });

  it("should correctly give medkits for objects", () => {
    const object: GameObject = MockGameObject.mock();

    giveWoundedObjectMedkit(object);

    expect(registry.simulator.create).toHaveBeenCalledWith(
      "medkit_script",
      object.position(),
      object.level_vertex_id(),
      object.game_vertex_id(),
      object.id()
    );
  });
});

describe("setObjectWounded util", () => {
  beforeEach(() => {
    registerSimulator();
  });

  it("should correctly set objects as wounded", () => {
    let objectHit: Optional<Hit> = null as Optional<Hit>;
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(object, "hit").mockImplementation((it: Hit) => {
      objectHit = it;
    });

    setObjectWounded(object);

    expect(object.hit).toHaveBeenCalled();
    expect(objectHit).not.toBeNull();
    expect(objectHit?.type).toBe(hit.fire_wound);
    expect(objectHit?.power).toBe(0.99);
    expect(objectHit?.impulse).toBe(0);
    expect(objectHit?.direction).toEqual(MockVector.mock(0, 0, -1));
    expect(objectHit?.draftsman).toBe(object);
  });
});

describe("enableObjectWoundedHealing util", () => {
  beforeEach(() => {
    registerSimulator();
  });

  it("should correctly enable healing for objects", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);
    const schemeState: ISchemeWoundedState = mockSchemeState<ISchemeWoundedState>(EScheme.WOUNDED, {
      woundManager: {
        unlockMedkit: jest.fn(),
      } as unknown as WoundManager,
    });

    state[EScheme.WOUNDED] = schemeState;

    enableObjectWoundedHealing(object);

    expect(schemeState.woundManager.unlockMedkit).toHaveBeenCalledTimes(1);
  });
});

describe("isObjectPsyWounded util", () => {
  beforeEach(() => {
    registerSimulator();
  });

  it("should correctly check if object is psy wounded", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);
    const schemeState: ISchemeWoundedState = mockSchemeState<ISchemeWoundedState>(EScheme.WOUNDED, {
      woundManager: {
        woundState: null,
      } as unknown as WoundManager,
    });

    state[EScheme.WOUNDED] = schemeState;

    expect(isObjectPsyWounded(object)).toBe(false);

    schemeState.woundManager.woundState = "test";
    expect(isObjectPsyWounded(object)).toBe(false);

    schemeState.woundManager.woundState = "physical";
    expect(isObjectPsyWounded(object)).toBe(false);

    schemeState.woundManager.woundState = "psy_pain";
    expect(isObjectPsyWounded(object)).toBe(true);

    schemeState.woundManager.woundState = "psy_armed";
    expect(isObjectPsyWounded(object)).toBe(true);

    schemeState.woundManager.woundState = "psy_shoot";
    expect(isObjectPsyWounded(object)).toBe(true);

    schemeState.woundManager.woundState = "psycho_pain";
    expect(isObjectPsyWounded(object)).toBe(true);

    schemeState.woundManager.woundState = "psycho_shoot";
    expect(isObjectPsyWounded(object)).toBe(true);
  });
});

describe("getNearestWoundedToHelp util", () => {
  beforeEach(() => {
    registerSimulator();
  });

  it.todo("should correctly find nearest wounded to heal");
});
