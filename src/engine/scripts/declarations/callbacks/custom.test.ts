import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";

import { EAchievement } from "@/engine/core/managers/achievements";
import { ActorInputManager } from "@/engine/core/managers/actor";
import { SleepManager } from "@/engine/core/managers/sleep";
import { taskConfig, TaskObject } from "@/engine/core/managers/tasks";
import { emitCutsceneEndedEvent } from "@/engine/core/schemes/restrictor/sr_cutscene/utils";
import { AnyArgs, AnyObject, TName } from "@/engine/lib/types";
import { callBinding, checkNestedBinding, resetRegistry } from "@/fixtures/engine";

jest.mock("@/engine/core/schemes/restrictor/sr_cutscene/utils", () => ({
  emitCutsceneEndedEvent: jest.fn(),
}));

describe("custom external callbacks", () => {
  const callEngineBinding = (name: TName, args: AnyArgs = []) => callBinding(name, args, (_G as AnyObject)["engine"]);

  beforeAll(() => {
    require("@/engine/scripts/declarations/callbacks/custom");
  });

  beforeEach(() => {
    resetRegistry();
  });

  it("should correctly inject external methods for game", () => {
    checkNestedBinding("engine", "on_anabiotic_sleep");
    checkNestedBinding("engine", "on_anabiotic_wake_up");
    checkNestedBinding("engine", "surge_survive_start");
    checkNestedBinding("engine", "surge_survive_end");
    checkNestedBinding("engine", "on_start_sleeping");
    checkNestedBinding("engine", "on_finish_sleeping");
    checkNestedBinding("engine", "is_task_completed");
    checkNestedBinding("engine", "is_task_failed");
    checkNestedBinding("engine", "effector_callback");
    checkNestedBinding("engine", "check_achievement");
  });

  it("engine.on_start_sleeping should correctly handle event", () => {
    const sleepManager: SleepManager = getManager(SleepManager);

    jest.spyOn(sleepManager, "onStartSleeping").mockImplementation(jest.fn);

    callEngineBinding("on_start_sleeping");
    expect(sleepManager.onStartSleeping).toHaveBeenCalled();
  });

  it("engine.on_finish_sleeping should correctly handle event", () => {
    const sleepManager: SleepManager = getManager(SleepManager);

    jest.spyOn(sleepManager, "onFinishSleeping").mockImplementation(jest.fn);

    callEngineBinding("on_finish_sleeping");
    expect(sleepManager.onFinishSleeping).toHaveBeenCalled();
  });

  it("engine.on_anabiotic_sleep should correctly handle event", () => {
    const actorInputManager: ActorInputManager = getManager(ActorInputManager);

    jest.spyOn(actorInputManager, "onAnabioticSleep").mockImplementation(jest.fn);

    callEngineBinding("on_anabiotic_sleep");
    expect(actorInputManager.onAnabioticSleep).toHaveBeenCalled();
  });

  it("engine.on_anabiotic_wake_up should correctly handle event", () => {
    const actorInputManager: ActorInputManager = getManager(ActorInputManager);

    jest.spyOn(actorInputManager, "onAnabioticWakeUp").mockImplementation(jest.fn);

    callEngineBinding("on_anabiotic_wake_up");
    expect(actorInputManager.onAnabioticWakeUp).toHaveBeenCalled();
  });

  it("engine.surge_survive_start should correctly handle event", () => {
    const actorInputManager: ActorInputManager = getManager(ActorInputManager);

    jest.spyOn(actorInputManager, "onSurgeSurviveStart").mockImplementation(jest.fn);

    callEngineBinding("surge_survive_start");
    expect(actorInputManager.onSurgeSurviveStart).toHaveBeenCalled();
  });

  it("engine.surge_survive_end should correctly handle event", () => {
    const actorInputManager: ActorInputManager = getManager(ActorInputManager);

    jest.spyOn(actorInputManager, "onSurgeSurviveEnd").mockImplementation(jest.fn);

    callEngineBinding("surge_survive_end");
    expect(actorInputManager.onSurgeSurviveEnd).toHaveBeenCalled();
  });

  it("engine.is_task_completed should correctly check completed state", () => {
    taskConfig.ACTIVE_TASKS.set("first", { isCompleted: () => true } as TaskObject);
    taskConfig.ACTIVE_TASKS.set("second", { isCompleted: () => false } as TaskObject);

    expect(callEngineBinding("is_task_completed", ["first"])).toBe(true);
    expect(callEngineBinding("is_task_completed", ["second"])).toBe(false);
  });

  it("engine.is_task_failed should correctly check failed state", () => {
    taskConfig.ACTIVE_TASKS.set("first", { isFailed: () => true } as TaskObject);
    taskConfig.ACTIVE_TASKS.set("second", { isFailed: () => false } as TaskObject);

    expect(callEngineBinding("is_task_failed", ["first"])).toBe(true);
    expect(callEngineBinding("is_task_failed", ["second"])).toBe(false);
  });

  it("engine.effector_callback should correctly handle event", () => {
    callEngineBinding("effector_callback");

    expect(emitCutsceneEndedEvent).toHaveBeenCalled();
  });

  it("engine.effector_callback should correctly check achievements", () => {
    Object.keys((_G as AnyObject)["engine"]["check_achievement"]).forEach(
      (it) => ((_G as AnyObject)["engine"]["check_achievement"][it as string] = jest.fn(() => true))
    );

    const callAchievementBinding = (name: EAchievement, args: AnyArgs = []) =>
      callBinding(name, args, (_G as AnyObject)["engine"]["check_achievement"]);

    expect(callAchievementBinding(EAchievement.BATTLE_SYSTEMS_MASTER)).toBe(true);
    expect(callAchievementBinding(EAchievement.DETECTIVE)).toBe(true);
    expect(callAchievementBinding(EAchievement.DIPLOMAT)).toBe(true);
    expect(callAchievementBinding(EAchievement.PIONEER)).toBe(true);
    expect(callAchievementBinding(EAchievement.MUTANT_HUNTER)).toBe(true);
    expect(callAchievementBinding(EAchievement.ONE_OF_THE_LADS)).toBe(true);
    expect(callAchievementBinding(EAchievement.KINGPIN)).toBe(true);
    expect(callAchievementBinding(EAchievement.HERALD_OF_JUSTICE)).toBe(true);
    expect(callAchievementBinding(EAchievement.SEEKER)).toBe(true);
    expect(callAchievementBinding(EAchievement.HIGH_TECH_MASTER)).toBe(true);
    expect(callAchievementBinding(EAchievement.SKILLED_STALKER)).toBe(true);
    expect(callAchievementBinding(EAchievement.LEADER)).toBe(true);
    expect(callAchievementBinding(EAchievement.RESEARCH_MAN)).toBe(true);
    expect(callAchievementBinding(EAchievement.FRIEND_OF_DUTY)).toBe(true);
    expect(callAchievementBinding(EAchievement.FRIEND_OF_FREEDOM)).toBe(true);
    expect(callAchievementBinding(EAchievement.BALANCE_ADVOCATE)).toBe(true);
    expect(callAchievementBinding(EAchievement.WEALTHY)).toBe(true);
    expect(callAchievementBinding(EAchievement.KEEPER_OF_SECRETS)).toBe(true);
    expect(callAchievementBinding(EAchievement.MARKED_BY_ZONE)).toBe(true);
    expect(callAchievementBinding(EAchievement.INFORMATION_DEALER)).toBe(true);
    expect(callAchievementBinding(EAchievement.FRIEND_OF_STALKERS)).toBe(true);
  });
});
