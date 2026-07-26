import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { EGameObjectRelation, GameObject } from "xray16/alias";
import { AnyObject, FALSE, NIL, TRUE } from "xray16/lib";
import { MockGameObject } from "xray16/mocks";
import { replaceFunctionMock, resetFunctionMock } from "xray16/testing/utils";

import { getManager, IRegistryObjectState, registerObject, registry } from "@/engine/core/database";
import { parseConditionsList } from "@/engine/core/ini";
import { SoundManager } from "@/engine/core/managers/sounds/SoundManager";
import { ISchemeAbuseState } from "@/engine/core/schemes/stalker/abuse";
import { ISchemeMeetState } from "@/engine/core/schemes/stalker/meet/meet_types";
import { MeetController } from "@/engine/core/schemes/stalker/meet/MeetController";
import {
  activateMeetWithObject,
  addObjectAbuse,
  clearObjectAbuse,
  setObjectAbuseState,
  updateObjectMeetAvailability,
} from "@/engine/core/schemes/stalker/meet/utils/meet_handling";
import { ISchemeWoundedState } from "@/engine/core/schemes/stalker/wounded";
import { setSchemeState } from "@/engine/core/schemes/state";
import { EScheme } from "@/engine/core/schemes/types";
import { isObjectHelpingWounded, isObjectSearchingCorpse } from "@/engine/core/utils/planner";
import { mockRegisteredActor, mockSchemeState, resetRegistry } from "@/fixtures/engine";

jest.mock("@/engine/core/utils/planner", () => ({
  isObjectHelpingWounded: jest.fn(() => false),
  isObjectSearchingCorpse: jest.fn(() => false),
}));

/**
 * Register object with a meet scheme state carrying the provided manager fields.
 */
function registerObjectWithMeet(
  object: GameObject,
  { use = null, isAbuseModeEnabled = null }: Partial<Pick<MeetController, "use" | "isAbuseModeEnabled">> = {},
  meetState: Partial<ISchemeMeetState> = {}
): ISchemeMeetState {
  const registryState: IRegistryObjectState = registerObject(object);
  const state: ISchemeMeetState = mockSchemeState<ISchemeMeetState>(EScheme.MEET, {
    useSound: parseConditionsList(NIL),
    ...meetState,
  });

  state.meetController = new MeetController(object, state);
  state.meetController.use = use;
  state.meetController.isAbuseModeEnabled = isAbuseModeEnabled;

  setSchemeState(registryState, EScheme.MEET, state);

  return state;
}

describe("addObjectAbuse", () => {
  it("should correctly add abuse values to the manager", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);
    const manager = { addAbuse: jest.fn() };

    setSchemeState(
      state,
      EScheme.ABUSE,
      mockSchemeState<ISchemeAbuseState>(EScheme.ABUSE, { abuseController: manager } as AnyObject)
    );

    addObjectAbuse(object, 10);
    expect(manager.addAbuse).toHaveBeenCalledWith(10);

    addObjectAbuse(object, 20);
    expect(manager.addAbuse).toHaveBeenCalledTimes(2);
  });
});

describe("clearObjectAbuse", () => {
  it("should correctly clear abuse state from the manager", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);
    const manager = { clearAbuse: jest.fn() };

    setSchemeState(
      state,
      EScheme.ABUSE,
      mockSchemeState<ISchemeAbuseState>(EScheme.ABUSE, { abuseController: manager } as AnyObject)
    );

    clearObjectAbuse(object);
    expect(manager.clearAbuse).toHaveBeenCalled();

    clearObjectAbuse(object);
    expect(manager.clearAbuse).toHaveBeenCalledTimes(2);
  });
});

describe("setObjectAbuseState", () => {
  it("should correctly set abuse state for the manager", () => {
    const object: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);
    const manager = { enableAbuse: jest.fn(), disableAbuse: jest.fn() };

    setSchemeState(
      state,
      EScheme.ABUSE,
      mockSchemeState<ISchemeAbuseState>(EScheme.ABUSE, { abuseController: manager } as AnyObject)
    );

    setObjectAbuseState(object, true);
    expect(manager.enableAbuse).toHaveBeenCalledTimes(1);

    setObjectAbuseState(object, false);
    expect(manager.disableAbuse).toHaveBeenCalledTimes(1);
  });
});

describe("updateObjectMeetAvailability", () => {
  beforeEach(() => {
    resetRegistry();
    resetFunctionMock(isObjectHelpingWounded);
    resetFunctionMock(isObjectSearchingCorpse);
    replaceFunctionMock(isObjectHelpingWounded, () => false);
    replaceFunctionMock(isObjectSearchingCorpse, () => false);
    mockRegisteredActor();
  });

  it("should disable talk for wounded enemy object", () => {
    const object: GameObject = MockGameObject.mock();
    const registryState: IRegistryObjectState = registerObject(object);

    jest.spyOn(object, "relation").mockImplementation(() => EGameObjectRelation.ENEMY);

    setSchemeState(
      registryState,
      EScheme.WOUNDED,
      mockSchemeState<ISchemeWoundedState>(EScheme.WOUNDED, {
        isTalkEnabled: true,
        woundController: { woundState: "wounded" },
      } as AnyObject)
    );

    updateObjectMeetAvailability(object, registryState);

    expect(object.disable_talk).toHaveBeenCalledTimes(1);
    expect(object.enable_talk).not.toHaveBeenCalled();
  });

  it("should follow wounded talk flag for non-enemy object", () => {
    const object: GameObject = MockGameObject.mock();
    const registryState: IRegistryObjectState = registerObject(object);
    const woundedState: ISchemeWoundedState = mockSchemeState<ISchemeWoundedState>(EScheme.WOUNDED, {
      isTalkEnabled: true,
      woundController: { woundState: "wounded" },
    } as AnyObject);

    jest.spyOn(object, "relation").mockImplementation(() => EGameObjectRelation.FRIEND);
    setSchemeState(registryState, EScheme.WOUNDED, woundedState);

    updateObjectMeetAvailability(object, registryState);

    expect(object.enable_talk).toHaveBeenCalledTimes(1);

    woundedState.isTalkEnabled = false;
    updateObjectMeetAvailability(object, registryState);

    expect(object.disable_talk).toHaveBeenCalledTimes(1);
  });

  it("should enable talk when meet use is allowed", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeMeetState = registerObjectWithMeet(object, { use: TRUE });

    updateObjectMeetAvailability(object, registry.objects.get(object.id()));

    expect(object.enable_talk).toHaveBeenCalledTimes(1);
    expect(state.meetController.use).toBe(TRUE);
  });

  it("should disable talk when object is busy with wounded or corpse", () => {
    const object: GameObject = MockGameObject.mock();

    registerObjectWithMeet(object, { use: TRUE });
    replaceFunctionMock(isObjectSearchingCorpse, () => true);

    updateObjectMeetAvailability(object, registry.objects.get(object.id()));

    expect(object.disable_talk).toHaveBeenCalledTimes(1);

    replaceFunctionMock(isObjectSearchingCorpse, () => false);
    replaceFunctionMock(isObjectHelpingWounded, () => true);

    updateObjectMeetAvailability(object, registry.objects.get(object.id()));

    expect(object.disable_talk).toHaveBeenCalledTimes(2);
  });

  it("should stop talking when meet use is not allowed", () => {
    const object: GameObject = MockGameObject.mock();

    registerObjectWithMeet(object, { use: FALSE });
    jest.spyOn(object, "is_talking").mockImplementation(() => true);

    updateObjectMeetAvailability(object, registry.objects.get(object.id()));

    expect(object.disable_talk).toHaveBeenCalledTimes(1);
    expect(object.stop_talk).toHaveBeenCalledTimes(1);
  });

  it("should do nothing for unknown meet use value", () => {
    const object: GameObject = MockGameObject.mock();

    registerObjectWithMeet(object, { use: "self" });

    updateObjectMeetAvailability(object, registry.objects.get(object.id()));

    expect(object.disable_talk).not.toHaveBeenCalled();
    expect(object.enable_talk).not.toHaveBeenCalled();
  });
});

describe("activateMeetWithObject", () => {
  beforeEach(() => {
    resetRegistry();
    mockRegisteredActor();
  });

  it("should do nothing for dead object", () => {
    const object: GameObject = MockGameObject.mock();
    const soundManager: SoundManager = getManager(SoundManager);

    jest.spyOn(object, "alive").mockImplementation(() => false);
    jest.spyOn(soundManager, "play").mockImplementation(() => null);
    registerObjectWithMeet(object, {}, { useSound: parseConditionsList("meet_sound") });

    activateMeetWithObject(object);

    expect(soundManager.play).not.toHaveBeenCalled();
  });

  it("should do nothing for object without meet scheme", () => {
    const object: GameObject = MockGameObject.mock();
    const soundManager: SoundManager = getManager(SoundManager);

    jest.spyOn(soundManager, "play").mockImplementation(() => null);
    registerObject(object);

    expect(() => activateMeetWithObject(object)).not.toThrow();
    expect(soundManager.play).not.toHaveBeenCalled();
  });

  it("should play meet sound", () => {
    const object: GameObject = MockGameObject.mock();
    const soundManager: SoundManager = getManager(SoundManager);

    jest.spyOn(soundManager, "play").mockImplementation(() => null);
    registerObjectWithMeet(object, {}, { useSound: parseConditionsList("meet_sound") });

    activateMeetWithObject(object);

    expect(soundManager.play).toHaveBeenCalledWith(object.id(), "meet_sound");
  });

  it("should add abuse when interacting with abusing friend that cannot be used", () => {
    const object: GameObject = MockGameObject.mock();
    const registryState: IRegistryObjectState = registerObject(object);
    const abuseController = { addAbuse: jest.fn() };
    const soundManager: SoundManager = getManager(SoundManager);

    jest.spyOn(soundManager, "play").mockImplementation(() => null);
    jest.spyOn(object, "relation").mockImplementation(() => EGameObjectRelation.FRIEND);

    setSchemeState(
      registryState,
      EScheme.ABUSE,
      mockSchemeState<ISchemeAbuseState>(EScheme.ABUSE, { abuseController } as AnyObject)
    );
    registerObjectWithMeet(object, { isAbuseModeEnabled: TRUE, use: FALSE });

    activateMeetWithObject(object);

    expect(abuseController.addAbuse).toHaveBeenCalledWith(1);
  });

  it("should not add abuse when object is not abusing", () => {
    const object: GameObject = MockGameObject.mock();
    const registryState: IRegistryObjectState = registerObject(object);
    const abuseController = { addAbuse: jest.fn() };

    jest.spyOn(object, "relation").mockImplementation(() => EGameObjectRelation.FRIEND);

    setSchemeState(
      registryState,
      EScheme.ABUSE,
      mockSchemeState<ISchemeAbuseState>(EScheme.ABUSE, { abuseController } as AnyObject)
    );
    registerObjectWithMeet(object, { isAbuseModeEnabled: FALSE, use: FALSE });

    activateMeetWithObject(object);

    expect(abuseController.addAbuse).not.toHaveBeenCalled();
  });
});
