import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { EGameObjectRelation, GameObject, IniFile } from "xray16/alias";
import { FALSE, NIL, TRUE } from "xray16/lib";
import { MockGameObject, MockIniFile } from "xray16/mocks";

import { NO_MEET_SECTION } from "@/engine/constants/sections";
import { parseConditionsList } from "@/engine/core/ini";
import { ISchemeMeetState } from "@/engine/core/schemes/stalker/meet/meet_types";
import { meetConfig } from "@/engine/core/schemes/stalker/meet/MeetConfig";
import { MeetManager } from "@/engine/core/schemes/stalker/meet/MeetManager";
import { initializeMeetScheme } from "@/engine/core/schemes/stalker/meet/utils/meet_initialize";
import { EScheme } from "@/engine/core/schemes/types";
import { mockRegisteredActor, mockSchemeState, resetRegistry } from "@/fixtures/engine";

function createMeetState(): { manager: MeetManager; state: ISchemeMeetState } {
  const state: ISchemeMeetState = mockSchemeState<ISchemeMeetState>(EScheme.MEET, { meetSection: null });
  const manager: MeetManager = new MeetManager(MockGameObject.mock(), state);

  jest.spyOn(manager, "initialize").mockImplementation(jest.fn());
  state.meetManager = manager;

  return { manager, state };
}

describe("initializeMeetScheme", () => {
  beforeEach(() => {
    resetRegistry();
    mockRegisteredActor();
  });

  it("should do nothing when section did not change", () => {
    const object: GameObject = MockGameObject.mock();
    const ini: IniFile = MockIniFile.mock("test.ltx", {});
    const { manager, state } = createMeetState();

    state.meetSection = "meet@test";

    initializeMeetScheme(object, ini, "meet@test", state);

    expect(manager.initialize).not.toHaveBeenCalled();
    expect(state.isMeetInitialized).toBeUndefined();
  });

  it("should re-initialize when previous section was nil", () => {
    const object: GameObject = MockGameObject.mock();
    const ini: IniFile = MockIniFile.mock("test.ltx", {});
    const { manager, state } = createMeetState();

    state.meetSection = NIL;

    initializeMeetScheme(object, ini, NIL, state);

    expect(manager.initialize).toHaveBeenCalledTimes(1);
    expect(state.isMeetInitialized).toBe(true);
  });

  it("should disable meet for no_meet section", () => {
    const object: GameObject = MockGameObject.mock();
    const ini: IniFile = MockIniFile.mock("test.ltx", {});
    const { manager, state } = createMeetState();

    initializeMeetScheme(object, ini, NO_MEET_SECTION, state);

    expect(state.meetSection).toBe(NO_MEET_SECTION);
    expect(state.closeDistance).toEqualLuaTables(parseConditionsList("0"));
    expect(state.closeAnimation).toEqualLuaTables(parseConditionsList(NIL));
    expect(state.closeSoundDistance).toEqualLuaTables(parseConditionsList("0"));
    expect(state.closeSoundHello).toEqualLuaTables(parseConditionsList(NIL));
    expect(state.closeSoundBye).toEqualLuaTables(parseConditionsList(NIL));
    expect(state.closeVictim).toEqualLuaTables(parseConditionsList(NIL));
    expect(state.farDistance).toEqualLuaTables(parseConditionsList("0"));
    expect(state.farAnimation).toEqualLuaTables(parseConditionsList(NIL));
    expect(state.farSoundDistance).toEqualLuaTables(parseConditionsList("0"));
    expect(state.farSound).toEqualLuaTables(parseConditionsList(NIL));
    expect(state.farVictim).toEqualLuaTables(parseConditionsList(NIL));
    expect(state.useSound).toEqualLuaTables(parseConditionsList(NIL));
    expect(state.use).toEqualLuaTables(parseConditionsList(FALSE));
    expect(state.meetDialog).toEqualLuaTables(parseConditionsList(NIL));
    expect(state.abuse).toEqualLuaTables(parseConditionsList(FALSE));
    expect(state.isTradeEnabled).toEqualLuaTables(parseConditionsList(TRUE));
    expect(state.isBreakAllowed).toEqualLuaTables(parseConditionsList(TRUE));
    expect(state.useText).toEqualLuaTables(parseConditionsList(NIL));
    expect(state.isMeetOnTalking).toBe(false);
    expect(state.resetDistance).toBe(meetConfig.MEET_RESET_DISTANCE);
    expect(state.isMeetOnlyAtPathEnabled).toBe(true);

    expect(manager.initialize).toHaveBeenCalledTimes(1);
    expect(state.isMeetInitialized).toBe(true);
  });

  it("should use neutral defaults for neutral objects", () => {
    const object: GameObject = MockGameObject.mock();
    const ini: IniFile = MockIniFile.mock("test.ltx", { "meet@test": {} });
    const { state } = createMeetState();

    jest.spyOn(object, "relation").mockImplementation(() => EGameObjectRelation.NEUTRAL);

    initializeMeetScheme(object, ini, "meet@test", state);

    expect(state.closeDistance).toEqualLuaTables(parseConditionsList(meetConfig.NEUTRAL_DEFAULTS.closeDistance));
    expect(state.closeAnimation).toEqualLuaTables(parseConditionsList(meetConfig.NEUTRAL_DEFAULTS.closeAnimation));
    expect(state.use).toEqualLuaTables(parseConditionsList(meetConfig.NEUTRAL_DEFAULTS.use));
    expect(state.useSound).toEqualLuaTables(parseConditionsList(meetConfig.NEUTRAL_DEFAULTS.useSound));
    expect(state.abuse).toEqualLuaTables(parseConditionsList(meetConfig.NEUTRAL_DEFAULTS.abuse));
    expect(state.isMeetOnTalking).toBe(true);
  });

  it("should use enemy defaults for enemy objects", () => {
    const object: GameObject = MockGameObject.mock();
    const ini: IniFile = MockIniFile.mock("test.ltx", { "meet@test": {} });
    const { state } = createMeetState();

    jest.spyOn(object, "relation").mockImplementation(() => EGameObjectRelation.ENEMY);

    initializeMeetScheme(object, ini, "meet@test", state);

    expect(state.closeDistance).toEqualLuaTables(parseConditionsList(meetConfig.ENEMY_DEFAULTS.closeDistance));
    expect(state.closeAnimation).toEqualLuaTables(parseConditionsList(NIL));
    expect(state.use).toEqualLuaTables(parseConditionsList(FALSE));
    expect(state.isMeetOnTalking).toBe(false);
  });

  it("should read overrides from ini section", () => {
    const object: GameObject = MockGameObject.mock();
    const ini: IniFile = MockIniFile.mock("test.ltx", {
      "meet@test": {
        abuse: TRUE,
        allow_break: FALSE,
        close_anim: "talk_default",
        close_distance: "4",
        close_snd_bye: "bye_sound",
        close_snd_distance: "6",
        close_snd_hello: "hello_sound",
        close_victim: "actor",
        far_anim: "threat_na",
        far_distance: "8",
        far_snd: "far_sound",
        far_snd_distance: "9",
        far_victim: "actor",
        meet_dialog: "test_dialog",
        meet_on_talking: FALSE,
        snd_on_use: "use_sound",
        trade_enable: FALSE,
        use: TRUE,
        use_text: "use_label",
      },
    });
    const { state } = createMeetState();

    jest.spyOn(object, "relation").mockImplementation(() => EGameObjectRelation.NEUTRAL);

    initializeMeetScheme(object, ini, "meet@test", state);

    expect(state.abuse).toEqualLuaTables(parseConditionsList(TRUE));
    expect(state.isBreakAllowed).toEqualLuaTables(parseConditionsList(FALSE));
    expect(state.closeAnimation).toEqualLuaTables(parseConditionsList("talk_default"));
    expect(state.closeDistance).toEqualLuaTables(parseConditionsList("4"));
    expect(state.closeSoundBye).toEqualLuaTables(parseConditionsList("bye_sound"));
    expect(state.closeSoundDistance).toEqualLuaTables(parseConditionsList("6"));
    expect(state.closeSoundHello).toEqualLuaTables(parseConditionsList("hello_sound"));
    expect(state.closeVictim).toEqualLuaTables(parseConditionsList("actor"));
    expect(state.farAnimation).toEqualLuaTables(parseConditionsList("threat_na"));
    expect(state.farDistance).toEqualLuaTables(parseConditionsList("8"));
    expect(state.farSound).toEqualLuaTables(parseConditionsList("far_sound"));
    expect(state.farSoundDistance).toEqualLuaTables(parseConditionsList("9"));
    expect(state.farVictim).toEqualLuaTables(parseConditionsList("actor"));
    expect(state.meetDialog).toEqualLuaTables(parseConditionsList("test_dialog"));
    expect(state.isMeetOnTalking).toBe(false);
    expect(state.useSound).toEqualLuaTables(parseConditionsList("use_sound"));
    expect(state.isTradeEnabled).toEqualLuaTables(parseConditionsList(FALSE));
    expect(state.use).toEqualLuaTables(parseConditionsList(TRUE));
    expect(state.useText).toEqualLuaTables(parseConditionsList("use_label"));
  });
});
