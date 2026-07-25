import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { game, level } from "xray16";
import { GameObject, ServerObject, Time } from "xray16/alias";
import { AnyObject, createTime } from "xray16/lib";
import { MockAlifeItem, MockGameObject } from "xray16/mocks";
import { replaceFunctionMock, resetFunctionMock } from "xray16/testing/utils";

import { animations, postProcessors } from "@/engine/constants/animation";
import { drugs } from "@/engine/constants/items/drugs";
import { getManager, registerSimulator, registry } from "@/engine/core/database";
import { EActorControlHandle, EActorControlPolicy } from "@/engine/core/managers/actor/actor_input_types";
import { ActorInputManager } from "@/engine/core/managers/actor/ActorInputManager";
import { surgeConfig } from "@/engine/core/managers/surge/SurgeConfig";
import { SurgeManager } from "@/engine/core/managers/surge/SurgeManager";
import { killAllSurgeUnhidden } from "@/engine/core/managers/surge/utils/surge_kill";
import { WeatherManager } from "@/engine/core/managers/weather/WeatherManager";
import { hasInfoPortion } from "@/engine/core/utils/info_portion";
import { mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

jest.mock("@/engine/core/managers/surge/utils/surge_kill", () => ({
  ...jest.requireActual<AnyObject>("@/engine/core/managers/surge/utils/surge_kill"),
  killAllSurgeUnhidden: jest.fn(),
}));

describe("ActorInputManager anabiotic handling", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
    mockRegisteredActor();

    resetFunctionMock(killAllSurgeUnhidden);

    surgeConfig.IS_STARTED = false;
    surgeConfig.IS_TIME_FORWARDED = false;
  });

  it("onActorUseItem should ignore missing objects and non-anabiotic items", () => {
    const manager: ActorInputManager = getManager(ActorInputManager);
    const item: ServerObject = MockAlifeItem.mock();
    const object: GameObject = MockGameObject.mock({ id: item.id });

    jest.spyOn(manager, "processAnabioticItemUsage").mockImplementation(jest.fn());

    manager.onActorUseItem(null);
    manager.onActorUseItem(object);

    expect(manager.processAnabioticItemUsage).toHaveBeenCalledTimes(0);
  });

  it("onActorUseItem should intercept anabiotic usage", () => {
    const manager: ActorInputManager = getManager(ActorInputManager);
    const item: ServerObject = MockAlifeItem.mock({ section: drugs.drug_anabiotic });
    const object: GameObject = MockGameObject.mock({ id: item.id });

    jest.spyOn(manager, "processAnabioticItemUsage").mockImplementation(jest.fn());

    manager.onActorUseItem(object);

    expect(manager.processAnabioticItemUsage).toHaveBeenCalledTimes(1);
  });

  it("onAnabioticSleep should advance the game time and refresh the weather", () => {
    const manager: ActorInputManager = getManager(ActorInputManager);
    const weatherManager: WeatherManager = getManager(WeatherManager);

    jest.spyOn(weatherManager, "forceWeatherChange").mockImplementation(jest.fn());
    jest.spyOn(Math, "random").mockImplementation(() => 0);

    manager.onAnabioticSleep();

    expect(level.add_cam_effector).toHaveBeenCalledWith(
      animations.camera_effects_surge_01,
      10,
      false,
      "engine.on_anabiotic_wake_up"
    );
    expect(level.change_game_time).toHaveBeenCalledWith(0, 0, expect.any(Number));
    expect(weatherManager.forceWeatherChange).toHaveBeenCalledTimes(1);
    expect(killAllSurgeUnhidden).toHaveBeenCalledTimes(0);
  });

  it("onAnabioticSleep should end an active surge that would be slept through", () => {
    const manager: ActorInputManager = getManager(ActorInputManager);
    const surgeManager: SurgeManager = getManager(SurgeManager);
    const weatherManager: WeatherManager = getManager(WeatherManager);
    const now: Time = createTime(2012, 6, 12, 20, 15, 30, 200);

    surgeConfig.IS_STARTED = true;

    // Almost no surge time left, so sleeping 35-45 minutes skips past its end.
    jest.spyOn(now, "diffSec").mockImplementation(() => surgeConfig.DURATION);
    replaceFunctionMock(game.get_game_time, () => now);
    replaceFunctionMock(level.get_time_factor, () => 1);

    jest.spyOn(weatherManager, "forceWeatherChange").mockImplementation(jest.fn());
    jest.spyOn(surgeManager, "endSurge").mockImplementation(jest.fn());

    manager.onAnabioticSleep();

    expect(surgeConfig.IS_TIME_FORWARDED).toBe(true);
    expect(surgeManager.isUiDisabled).toBe(true);
    expect(killAllSurgeUnhidden).toHaveBeenCalledTimes(1);
    expect(surgeManager.endSurge).toHaveBeenCalledTimes(1);
  });

  it("onAnabioticSleep should leave a long running surge alone", () => {
    const manager: ActorInputManager = getManager(ActorInputManager);
    const surgeManager: SurgeManager = getManager(SurgeManager);
    const weatherManager: WeatherManager = getManager(WeatherManager);
    const now: Time = createTime(2012, 6, 12, 20, 15, 30, 200);

    surgeConfig.IS_STARTED = true;

    jest.spyOn(now, "diffSec").mockImplementation(() => 0);
    replaceFunctionMock(game.get_game_time, () => now);
    replaceFunctionMock(level.get_time_factor, () => 1_000);

    jest.spyOn(weatherManager, "forceWeatherChange").mockImplementation(jest.fn());
    jest.spyOn(surgeManager, "endSurge").mockImplementation(jest.fn());

    manager.onAnabioticSleep();

    expect(surgeConfig.IS_TIME_FORWARDED).toBe(false);
    expect(killAllSurgeUnhidden).toHaveBeenCalledTimes(0);
    expect(surgeManager.endSurge).toHaveBeenCalledTimes(0);
  });

  it("onAnabioticWakeUp should restore volumes and release the ui lock", () => {
    const manager: ActorInputManager = getManager(ActorInputManager);

    registry.musicVolume = 0.7;
    registry.effectsVolume = 0.4;

    manager.acquireControl(EActorControlHandle.ANABIOTIC, "anabiotic", EActorControlPolicy.UI_ONLY, true);
    manager.onAnabioticWakeUp();

    expect(registry.musicVolume).toBe(0);
    expect(registry.effectsVolume).toBe(0);
    expect(hasInfoPortion("anabiotic_in_process")).toBe(false);
  });

  it("onSurgeSurviveStart should apply the sleep camera effector", () => {
    const manager: ActorInputManager = getManager(ActorInputManager);

    manager.onSurgeSurviveStart();

    expect(level.add_cam_effector).toHaveBeenCalledWith(
      animations.camera_effects_surge_01,
      surgeConfig.SLEEP_CAM_EFFECTOR_ID,
      false,
      "engine.surge_survive_end"
    );
  });

  it("onSurgeSurviveEnd should release the surge ui lock", () => {
    const manager: ActorInputManager = getManager(ActorInputManager);

    jest.spyOn(manager, "releaseGameUiControl").mockImplementation(jest.fn());

    manager.onSurgeSurviveEnd();

    expect(manager.releaseGameUiControl).toHaveBeenCalledWith(EActorControlHandle.SURGE);
  });

  it("processAnabioticItemUsage should apply the sleep effectors", () => {
    const manager: ActorInputManager = getManager(ActorInputManager);

    manager.processAnabioticItemUsage();

    expect(level.add_cam_effector).toHaveBeenCalledWith(
      animations.camera_effects_surge_02,
      10,
      false,
      "engine.on_anabiotic_sleep"
    );
    expect(level.add_pp_effector).toHaveBeenCalledWith(postProcessors.surge_fade, 11, false);
  });
});
