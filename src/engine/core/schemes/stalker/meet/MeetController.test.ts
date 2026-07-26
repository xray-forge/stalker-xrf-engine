import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { FALSE, NIL, TRUE } from "xray16/lib";
import { MockAlifeSimulator, MockGameObject, MockVector } from "xray16/mocks";
import { replaceFunctionMock, resetFunctionMock } from "xray16/testing/utils";

import { EStalkerState } from "@/engine/core/animation/types";
import { getManager, registerStoryLink, registry, setStalkerState } from "@/engine/core/database";
import { parseConditionsList } from "@/engine/core/ini";
import { SoundManager } from "@/engine/core/managers/sounds/SoundManager";
import { EMeetDistance, ISchemeMeetState } from "@/engine/core/schemes/stalker/meet/meet_types";
import { MeetController } from "@/engine/core/schemes/stalker/meet/MeetController";
import { setObjectAbuseState } from "@/engine/core/schemes/stalker/meet/utils";
import { EScheme } from "@/engine/core/schemes/types";
import { isBlackScreen } from "@/engine/core/utils/game";
import { isObjectInCombat, isObjectWounded } from "@/engine/core/utils/planner";
import { mockRegisteredActor, mockSchemeState, resetRegistry } from "@/fixtures/engine";

jest.mock("@/engine/core/database/stalker", () => ({ setStalkerState: jest.fn() }));
jest.mock("@/engine/core/schemes/stalker/meet/utils", () => ({ setObjectAbuseState: jest.fn() }));
jest.mock("@/engine/core/utils/game", () => ({ isBlackScreen: jest.fn(() => false) }));
jest.mock("@/engine/core/utils/planner", () => ({
  isObjectInCombat: jest.fn(() => false),
  isObjectWounded: jest.fn(() => false),
}));

function createMeetState(base: Partial<ISchemeMeetState> = {}): ISchemeMeetState {
  return mockSchemeState<ISchemeMeetState>(EScheme.MEET, {
    abuse: parseConditionsList(FALSE),
    closeAnimation: parseConditionsList(NIL),
    closeDistance: parseConditionsList("3"),
    closeSoundBye: parseConditionsList(NIL),
    closeSoundDistance: parseConditionsList("3"),
    closeSoundHello: parseConditionsList(NIL),
    closeVictim: parseConditionsList(NIL),
    farAnimation: parseConditionsList(NIL),
    farDistance: parseConditionsList("5"),
    farSound: parseConditionsList(NIL),
    farSoundDistance: parseConditionsList("5"),
    farVictim: parseConditionsList(NIL),
    isBreakAllowed: parseConditionsList(TRUE),
    isMeetOnTalking: true,
    isTradeEnabled: parseConditionsList(TRUE),
    meetDialog: parseConditionsList(NIL),
    resetDistance: 30,
    use: parseConditionsList(FALSE),
    useSound: parseConditionsList(NIL),
    useText: parseConditionsList(NIL),
    ...base,
  });
}

/**
 * Create meet controller over object placed at given distance from the actor.
 */
function createController(
  state: ISchemeMeetState,
  distance: number = 0
): { actor: GameObject; controller: MeetController; object: GameObject } {
  const { actorGameObject } = mockRegisteredActor({ position: MockVector.create(0, 0, 0) });
  const object: GameObject = MockGameObject.mock({ position: MockVector.create(0, 0, distance) });

  return { actor: actorGameObject, controller: new MeetController(object, state), object };
}

describe("MeetController", () => {
  beforeEach(() => {
    resetRegistry();
    resetFunctionMock(setStalkerState);
    resetFunctionMock(setObjectAbuseState);
    resetFunctionMock(isBlackScreen);
    resetFunctionMock(isObjectInCombat);
    resetFunctionMock(isObjectWounded);
    replaceFunctionMock(isBlackScreen, () => false);
    replaceFunctionMock(isObjectInCombat, () => false);
    replaceFunctionMock(isObjectWounded, () => false);
  });

  it("should correctly initialize defaults", () => {
    const { controller } = createController(createMeetState());

    expect(controller.startDialog).toBeNull();
    expect(controller.isAbuseModeEnabled).toBeNull();
    expect(controller.currentDistanceToSpeaker).toBeNull();
    expect(controller.use).toBeNull();
    expect(controller.isTradingEnabled).toBeNull();
    expect(controller.isCampStoryDirector).toBe(false);
    expect(controller.isDialogBreakEnabled).toBeNull();
    expect(controller.isHelloPassed).toBe(false);
    expect(controller.isByePassed).toBe(false);
  });

  it("should reset state on initialize when object is not alive", () => {
    const { controller, object } = createController(createMeetState(), 1);

    jest.spyOn(object, "alive").mockImplementation(() => false);

    controller.isHelloPassed = true;
    controller.isByePassed = true;
    controller.currentDistanceToSpeaker = EMeetDistance.CLOSE;

    controller.initialize();

    expect(controller.isHelloPassed).toBe(false);
    expect(controller.isByePassed).toBe(false);
    expect(controller.currentDistanceToSpeaker).toBeNull();
  });

  it("should detect close distance on initialize", () => {
    const { controller, object } = createController(createMeetState(), 1);

    jest.spyOn(object, "see").mockImplementation(() => true);

    controller.initialize();

    expect(controller.isHelloPassed).toBe(true);
    expect(controller.currentDistanceToSpeaker).toBe(EMeetDistance.CLOSE);
  });

  it("should detect close distance on initialize while talking", () => {
    const { controller, object } = createController(createMeetState(), 100);

    jest.spyOn(object, "see").mockImplementation(() => false);
    jest.spyOn(object, "is_talking").mockImplementation(() => true);

    controller.initialize();

    expect(controller.currentDistanceToSpeaker).toBe(EMeetDistance.CLOSE);
  });

  it("should detect far distance on initialize", () => {
    const { controller, object } = createController(createMeetState(), 4);

    jest.spyOn(object, "see").mockImplementation(() => true);

    controller.initialize();

    expect(controller.isByePassed).toBe(true);
    expect(controller.currentDistanceToSpeaker).toBe(EMeetDistance.FAR);
  });

  it("should reset state on initialize when actor is far away", () => {
    const { controller, object } = createController(createMeetState(), 40);

    jest.spyOn(object, "see").mockImplementation(() => false);

    controller.isHelloPassed = true;
    controller.isByePassed = true;

    controller.initialize();

    expect(controller.isHelloPassed).toBe(false);
    expect(controller.isByePassed).toBe(false);
    expect(controller.currentDistanceToSpeaker).toBeNull();
  });

  it("should keep greeting state on initialize in between distances", () => {
    const { controller, object } = createController(createMeetState(), 10);

    jest.spyOn(object, "see").mockImplementation(() => false);

    controller.isHelloPassed = true;
    controller.currentDistanceToSpeaker = EMeetDistance.CLOSE;

    controller.initialize();

    expect(controller.isHelloPassed).toBe(true);
    expect(controller.currentDistanceToSpeaker).toBeNull();
  });

  it("should execute nothing when distance to speaker is unknown", () => {
    const { controller } = createController(createMeetState());
    const soundManager: SoundManager = getManager(SoundManager);

    jest.spyOn(soundManager, "play").mockImplementation(() => null);

    controller.execute();

    expect(setStalkerState).not.toHaveBeenCalled();
    expect(soundManager.play).not.toHaveBeenCalled();
  });

  it("should execute close animation with victim look target", () => {
    const victim: GameObject = MockGameObject.mock();

    registry.simulator = MockAlifeSimulator.getInstance();
    registerStoryLink(victim.id(), "victim_sid");

    const { controller, object } = createController(
      createMeetState({
        closeAnimation: parseConditionsList(EStalkerState.TALK_DEFAULT),
        closeVictim: parseConditionsList("victim_sid"),
      })
    );

    controller.currentDistanceToSpeaker = EMeetDistance.CLOSE;
    controller.execute();

    expect(setStalkerState).toHaveBeenCalledWith(object, EStalkerState.TALK_DEFAULT, null, null, {
      lookObjectId: victim.id(),
      lookPosition: null,
    });
  });

  it("should execute far animation and play sound", () => {
    const { controller, object } = createController(
      createMeetState({
        farAnimation: parseConditionsList(EStalkerState.THREAT_NA),
        farSound: parseConditionsList("meet_far_sound"),
      })
    );
    const soundManager: SoundManager = getManager(SoundManager);

    jest.spyOn(soundManager, "play").mockImplementation(() => null);

    controller.currentDistanceToSpeaker = EMeetDistance.FAR;
    controller.execute();

    expect(setStalkerState).toHaveBeenCalledWith(object, EStalkerState.THREAT_NA, null, null, {
      lookObjectId: undefined,
      lookPosition: null,
    });
    expect(soundManager.play).toHaveBeenCalledWith(object.id(), "meet_far_sound");
  });

  it("should play hello sound once when actor gets close", () => {
    const { controller, object } = createController(
      createMeetState({ closeSoundHello: parseConditionsList("meet_hello") }),
      1
    );
    const soundManager: SoundManager = getManager(SoundManager);

    jest.spyOn(object, "see").mockImplementation(() => true);
    jest.spyOn(soundManager, "play").mockImplementation(() => null);

    controller.update();

    expect(controller.isHelloPassed).toBe(true);
    expect(soundManager.play).toHaveBeenCalledWith(object.id(), "meet_hello");

    controller.update();

    expect(soundManager.play).toHaveBeenCalledTimes(1);
  });

  it("should not play hello sound in combat", () => {
    const { controller, object } = createController(
      createMeetState({ closeSoundHello: parseConditionsList("meet_hello") }),
      1
    );
    const soundManager: SoundManager = getManager(SoundManager);

    jest.spyOn(object, "see").mockImplementation(() => true);
    jest.spyOn(soundManager, "play").mockImplementation(() => null);
    replaceFunctionMock(isObjectInCombat, () => true);

    controller.update();

    expect(controller.isHelloPassed).toBe(true);
    expect(soundManager.play).not.toHaveBeenCalled();
  });

  it("should play bye sound once when actor moves away", () => {
    const { controller, object } = createController(
      createMeetState({ closeSoundBye: parseConditionsList("meet_bye") }),
      4
    );
    const soundManager: SoundManager = getManager(SoundManager);

    jest.spyOn(object, "see").mockImplementation(() => true);
    jest.spyOn(soundManager, "play").mockImplementation(() => null);

    controller.isHelloPassed = true;
    controller.update();

    expect(controller.isByePassed).toBe(true);
    expect(soundManager.play).toHaveBeenCalledWith(object.id(), "meet_bye");

    controller.update();

    expect(soundManager.play).toHaveBeenCalledTimes(1);
  });

  it("should reset greeting state on update when actor is far away", () => {
    const { controller, object } = createController(createMeetState(), 40);

    jest.spyOn(object, "see").mockImplementation(() => false);

    controller.isHelloPassed = true;
    controller.isByePassed = true;
    controller.update();

    expect(controller.isHelloPassed).toBe(false);
    expect(controller.isByePassed).toBe(false);
    expect(controller.currentDistanceToSpeaker).toBeNull();
  });

  it("should update distance to speaker", () => {
    const { controller, object } = createController(createMeetState(), 1);

    jest.spyOn(object, "see").mockImplementation(() => true);

    controller.update();
    expect(controller.currentDistanceToSpeaker).toBe(EMeetDistance.CLOSE);

    jest.spyOn(object, "position").mockImplementation(() => MockVector.create(0, 0, 4));
    controller.update();
    expect(controller.currentDistanceToSpeaker).toBe(EMeetDistance.FAR);

    jest.spyOn(object, "position").mockImplementation(() => MockVector.create(0, 0, 10));
    controller.update();
    expect(controller.currentDistanceToSpeaker).toBeNull();
  });

  it("should treat talking object as close when meet on talking is enabled", () => {
    const { controller, object } = createController(createMeetState({ isMeetOnTalking: true }), 100);

    jest.spyOn(object, "see").mockImplementation(() => false);
    jest.spyOn(object, "is_talking").mockImplementation(() => true);

    controller.update();

    expect(controller.currentDistanceToSpeaker).toBe(EMeetDistance.CLOSE);
  });

  it("should set and restore start dialog", () => {
    const { controller, object, actor } = createController(
      createMeetState({ meetDialog: parseConditionsList("test_dialog") }),
      1
    );

    jest.spyOn(object, "see").mockImplementation(() => true);
    jest.spyOn(object, "is_talking").mockImplementation(() => true);

    controller.update();

    expect(controller.startDialog).toBe("test_dialog");
    expect(object.set_start_dialog).toHaveBeenCalledWith("test_dialog");
    expect(actor.run_talk_dialog).toHaveBeenCalledWith(object, false);

    controller.state.meetDialog = parseConditionsList(NIL);
    controller.update();

    expect(object.restore_default_start_dialog).toHaveBeenCalledTimes(1);
  });

  it("should start talking when use is set to self", () => {
    const { controller, object, actor } = createController(createMeetState({ use: parseConditionsList("self") }), 1);

    jest.spyOn(object, "see").mockImplementation(() => true);

    controller.update();

    expect(object.enable_talk).toHaveBeenCalledTimes(1);
    expect(object.allow_break_talk_dialog).toHaveBeenCalledWith(true);
    expect(actor.run_talk_dialog).toHaveBeenCalledWith(object, false);
    expect(controller.use).toBe("self");
  });

  it("should not remember use section while black screen is shown", () => {
    const { controller, object } = createController(createMeetState({ use: parseConditionsList("self") }), 1);

    jest.spyOn(object, "see").mockImplementation(() => true);
    replaceFunctionMock(isBlackScreen, () => true);

    controller.update();

    expect(object.enable_talk).not.toHaveBeenCalled();
    expect(controller.use).toBeNull();
  });

  it("should force use to false for camp story director", () => {
    const { controller, object } = createController(createMeetState({ use: parseConditionsList(TRUE) }), 1);

    jest.spyOn(object, "see").mockImplementation(() => true);

    controller.isCampStoryDirector = true;
    controller.update();

    expect(controller.use).toBe(FALSE);
  });

  it("should set interaction tip text", () => {
    const { controller, object } = createController(createMeetState({ useText: parseConditionsList("custom_tip") }), 1);

    jest.spyOn(object, "see").mockImplementation(() => true);

    controller.update();

    expect(object.set_tip_text).toHaveBeenCalledWith("custom_tip");
  });

  it("should set default interaction tip text based on talk availability", () => {
    const { controller, object } = createController(createMeetState(), 1);

    jest.spyOn(object, "see").mockImplementation(() => true);
    jest.spyOn(object, "is_talk_enabled").mockImplementation(() => true);

    controller.update();

    expect(object.set_tip_text).toHaveBeenCalledWith("character_use");

    jest.spyOn(object, "is_talk_enabled").mockImplementation(() => false);
    controller.update();

    expect(object.set_tip_text).toHaveBeenCalledWith("");
  });

  it("should toggle abuse state only on change", () => {
    const { controller, object } = createController(createMeetState({ abuse: parseConditionsList(TRUE) }), 1);

    jest.spyOn(object, "see").mockImplementation(() => true);

    controller.update();

    expect(setObjectAbuseState).toHaveBeenCalledTimes(1);
    expect(setObjectAbuseState).toHaveBeenCalledWith(object, true);
    expect(controller.isAbuseModeEnabled).toBe(TRUE);

    controller.update();

    expect(setObjectAbuseState).toHaveBeenCalledTimes(1);

    controller.state.abuse = parseConditionsList(FALSE);
    controller.update();

    expect(setObjectAbuseState).toHaveBeenCalledWith(object, false);
  });

  it("should toggle trading based on condlist", () => {
    const { controller, object } = createController(createMeetState({ isTradeEnabled: parseConditionsList(TRUE) }), 1);

    jest.spyOn(object, "see").mockImplementation(() => true);

    controller.update();

    expect(controller.isTradingEnabled).toBe(true);
    expect(object.enable_trade).toHaveBeenCalledTimes(1);

    controller.update();

    expect(object.enable_trade).toHaveBeenCalledTimes(1);

    controller.state.isTradeEnabled = parseConditionsList(FALSE);
    controller.update();

    expect(controller.isTradingEnabled).toBe(false);
    expect(object.disable_trade).toHaveBeenCalledTimes(1);
  });

  it("should disable trading for wounded object", () => {
    const { controller, object } = createController(createMeetState({ isTradeEnabled: parseConditionsList(TRUE) }), 1);

    jest.spyOn(object, "see").mockImplementation(() => true);
    replaceFunctionMock(isObjectWounded, () => true);

    controller.update();

    expect(controller.isTradingEnabled).toBe(false);
    expect(object.enable_trade).not.toHaveBeenCalled();
    expect(object.disable_trade).not.toHaveBeenCalled();
  });
});
