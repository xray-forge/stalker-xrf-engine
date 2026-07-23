import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { hit, level } from "xray16";
import { EGameObjectRelation, GameObject, Hit } from "xray16/alias";
import { Nillable } from "xray16/lib";
import { MockGameObject, MockVector } from "xray16/mocks";

import {
  IRegistryObjectState,
  registerObject,
  registerSimulator,
  registry,
  setPortableStoreValue,
} from "@/engine/core/database";
import { helpWoundedConfig } from "@/engine/core/schemes/stalker/help_wounded/HelpWoundedConfig";
import { ISchemeWoundedState } from "@/engine/core/schemes/stalker/wounded";
import { WoundManager } from "@/engine/core/schemes/stalker/wounded/WoundManager";
import { setSchemeState } from "@/engine/core/schemes/state";
import { EScheme } from "@/engine/core/schemes/types";
import {
  enableObjectWoundedHealing,
  getNearestWoundedToHelp,
  giveWoundedObjectMedkit,
  isObjectPsyWounded,
  setObjectWounded,
} from "@/engine/core/utils/object/object_wounds";
import { mockSchemeState } from "@/fixtures/engine";

describe("giveWoundedObjectMedkit", () => {
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

describe("setObjectWounded", () => {
  beforeEach(() => {
    registerSimulator();
  });

  it("should correctly set objects as wounded", () => {
    let objectHit: Nillable<Hit> = null as Nillable<Hit>;
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

describe("enableObjectWoundedHealing", () => {
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

    setSchemeState(state, EScheme.WOUNDED, schemeState);

    enableObjectWoundedHealing(object);

    expect(schemeState.woundManager.unlockMedkit).toHaveBeenCalledTimes(1);
  });
});

describe("isObjectPsyWounded", () => {
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

    setSchemeState(state, EScheme.WOUNDED, schemeState);

    const objectWithoutWounds: GameObject = MockGameObject.mock();

    registerObject(objectWithoutWounds);
    expect(isObjectPsyWounded(objectWithoutWounds)).toBe(false);
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

describe("getNearestWoundedToHelp", () => {
  beforeEach(() => {
    registerSimulator();
    registry.objectsWounded = new LuaMap();
  });

  it("should choose the nearest reachable, neutral wounded stalker available to the helper", () => {
    const helper: GameObject = MockGameObject.mock({ position: MockVector.create(0, 0, 0) });
    const selected: GameObject = MockGameObject.mock({ position: MockVector.create(1, 0, 0) });
    const farther: GameObject = MockGameObject.mock({ position: MockVector.create(2, 0, 0) });
    const claimed: GameObject = MockGameObject.mock({ position: MockVector.create(0.5, 0, 0) });
    const enemy: GameObject = MockGameObject.mock({ position: MockVector.create(0.25, 0, 0) });

    [selected, farther, claimed, enemy].forEach((wounded: GameObject) => {
      const state: IRegistryObjectState = registerObject(wounded);

      setSchemeState(state, EScheme.WOUNDED, mockSchemeState<ISchemeWoundedState>(EScheme.WOUNDED));
      registry.objectsWounded.set(wounded.id(), state);
    });

    setPortableStoreValue(claimed.id(), helpWoundedConfig.HELPING_WOUNDED_OBJECT_KEY, 999);
    jest.spyOn(enemy, "relation").mockImplementation(() => EGameObjectRelation.ENEMY);
    jest.spyOn(helper, "accessible").mockImplementation(() => true);
    jest.spyOn(helper.position(), "distance_to_sqr").mockImplementation((position) => {
      return position === selected.position() ? 1 : position === farther.position() ? 4 : 0.25;
    });
    jest.spyOn(level, "vertex_id").mockImplementation(() => 314);

    expect(getNearestWoundedToHelp(helper)).toEqual([selected, 314, selected.position()]);
  });

  it("should return an empty target when no wounded stalker can be helped", () => {
    expect(getNearestWoundedToHelp(MockGameObject.mock())).toEqual([null, null, null]);
  });
});
