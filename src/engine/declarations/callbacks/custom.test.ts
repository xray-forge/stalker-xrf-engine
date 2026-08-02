import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { AnyArgs, AnyObject, TName } from "xray16/lib";

import { getManager } from "@/engine/core/database";
import { ActorInputManager } from "@/engine/core/managers/actor";
import { SleepManager } from "@/engine/core/managers/sleep";
import { taskConfig, TaskObject } from "@/engine/core/managers/tasks";
import { emitCutsceneEndedEvent } from "@/engine/core/schemes/restrictor/sr_cutscene/utils";
import { achievementsPreconditionsMap, EAchievement } from "@/engine/core/utils/achievements";
import { callBinding, resetRegistry } from "@/fixtures/engine";

function callEngineBinding(name: TName, args: AnyArgs = []): unknown {
  return callBinding(name, args, (_G as AnyObject)["engine"]);
}

function callAchievementBinding(name: EAchievement, args: AnyArgs = []): boolean {
  return callBinding(name, args, (_G as AnyObject)["engine"]["check_achievement"]);
}

jest.mock("@/engine/core/schemes/restrictor/sr_cutscene/utils");

beforeAll(() => {
  require("@/engine/declarations/callbacks/custom");
});

beforeEach(() => {
  resetRegistry();
});

describe("engine.on_start_sleeping", () => {
  it("should correctly handle event", () => {
    const sleepManager: SleepManager = getManager(SleepManager);

    jest.spyOn(sleepManager, "onStartSleeping").mockImplementation(jest.fn);

    callEngineBinding("on_start_sleeping");
    expect(sleepManager.onStartSleeping).toHaveBeenCalled();
  });
});

describe("engine.on_finish_sleeping", () => {
  it("should correctly handle event", () => {
    const sleepManager: SleepManager = getManager(SleepManager);

    jest.spyOn(sleepManager, "onFinishSleeping").mockImplementation(jest.fn);

    callEngineBinding("on_finish_sleeping");
    expect(sleepManager.onFinishSleeping).toHaveBeenCalled();
  });
});

describe("engine.on_anabiotic_sleep", () => {
  it("should correctly handle event", () => {
    const actorInputManager: ActorInputManager = getManager(ActorInputManager);

    jest.spyOn(actorInputManager, "onAnabioticSleep").mockImplementation(jest.fn);

    callEngineBinding("on_anabiotic_sleep");
    expect(actorInputManager.onAnabioticSleep).toHaveBeenCalled();
  });
});

describe("engine.on_anabiotic_wake_up", () => {
  it("should correctly handle event", () => {
    const actorInputManager: ActorInputManager = getManager(ActorInputManager);

    jest.spyOn(actorInputManager, "onAnabioticWakeUp").mockImplementation(jest.fn);

    callEngineBinding("on_anabiotic_wake_up");
    expect(actorInputManager.onAnabioticWakeUp).toHaveBeenCalled();
  });
});

describe("engine.surge_survive_start", () => {
  it("should correctly handle event", () => {
    const actorInputManager: ActorInputManager = getManager(ActorInputManager);

    jest.spyOn(actorInputManager, "onSurgeSurviveStart").mockImplementation(jest.fn);

    callEngineBinding("surge_survive_start");
    expect(actorInputManager.onSurgeSurviveStart).toHaveBeenCalled();
  });
});

describe("engine.surge_survive_end", () => {
  it("should correctly handle event", () => {
    const actorInputManager: ActorInputManager = getManager(ActorInputManager);

    jest.spyOn(actorInputManager, "onSurgeSurviveEnd").mockImplementation(jest.fn);

    callEngineBinding("surge_survive_end");
    expect(actorInputManager.onSurgeSurviveEnd).toHaveBeenCalled();
  });
});

describe("engine.is_task_completed", () => {
  it("should correctly check completed state", () => {
    taskConfig.ACTIVE_TASKS.set("first", { isCompleted: () => true } as TaskObject);
    taskConfig.ACTIVE_TASKS.set("second", { isCompleted: () => false } as TaskObject);

    expect(callEngineBinding("is_task_completed", ["first"])).toBe(true);
    expect(callEngineBinding("is_task_completed", ["second"])).toBe(false);
  });
});

describe("engine.is_task_failed", () => {
  it("should correctly check failed state", () => {
    taskConfig.ACTIVE_TASKS.set("first", { isFailed: () => true } as TaskObject);
    taskConfig.ACTIVE_TASKS.set("second", { isFailed: () => false } as TaskObject);

    expect(callEngineBinding("is_task_failed", ["first"])).toBe(true);
    expect(callEngineBinding("is_task_failed", ["second"])).toBe(false);
  });
});

describe("engine.effector_callback", () => {
  it("should correctly handle event", () => {
    callEngineBinding("effector_callback");

    expect(emitCutsceneEndedEvent).toHaveBeenCalled();
  });
  it("should correctly check achievements", () => {
    expect((_G as AnyObject)["engine"]["check_achievement"]).toBe(achievementsPreconditionsMap);

    Object.keys((_G as AnyObject)["engine"]["check_achievement"]).forEach(
      (it) => ((_G as AnyObject)["engine"]["check_achievement"][it as string] = jest.fn(() => true))
    );

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
