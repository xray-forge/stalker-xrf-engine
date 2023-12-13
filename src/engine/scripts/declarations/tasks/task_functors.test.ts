import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";

import { registerStoryLink } from "@/engine/core/database/story_objects";
import { getActorTargetSurgeCover, isActorInSurgeCover } from "@/engine/core/managers/surge/utils/surge_cover";
import { giveInfoPortion } from "@/engine/core/utils/info_portion";
import { AnyArgs, AnyObject, GameObject, TName } from "@/engine/lib/types";
import { callBinding, checkNestedBinding, mockRegisteredActor, resetRegistry } from "@/fixtures/engine";
import { replaceFunctionMock } from "@/fixtures/jest";
import { MockGameObject } from "@/fixtures/xray";

jest.mock("@/engine/core/managers/surge/utils/surge_cover", () => ({
  isActorInSurgeCover: jest.fn(() => true),
  getActorTargetSurgeCover: jest.fn(() => null),
}));

describe("task_functors external callbacks declaration", () => {
  const checkTaskBinding = (name: TName) => checkNestedBinding("task_functors", name);

  beforeAll(() => {
    require("@/engine/scripts/declarations/tasks/task_functors");
  });

  it("should correctly inject task functors", () => {
    checkTaskBinding("condlist");
    checkTaskBinding("surge_task_title");
    checkTaskBinding("surge_task_descr");
    checkTaskBinding("target_condlist");
    checkTaskBinding("surge_task_target");
  });
});

describe("task_functors external callbacks implementation", () => {
  const callTaskBinding = (name: TName, args: AnyArgs = []) => callBinding(name, args, (_G as AnyObject).task_functors);

  beforeAll(() => {
    require("@/engine/scripts/declarations/tasks/task_functors");
  });

  beforeEach(() => {
    resetRegistry();
  });

  it("condlist should parse condition list from parameters", () => {
    mockRegisteredActor();
    expect(callTaskBinding("condlist", ["a", "b", "{+test_info} first, second"])).toBe("second");

    giveInfoPortion("test_info");
    expect(callTaskBinding("condlist", ["a", "b", "{+test_info} first, second"])).toBe("first");
  });

  it("surge_task_title should correctly return title", () => {
    replaceFunctionMock(isActorInSurgeCover, () => true);
    expect(callTaskBinding("surge_task_title")).toBe("hide_from_surge_name_2");

    replaceFunctionMock(isActorInSurgeCover, () => false);
    expect(callTaskBinding("surge_task_title")).toBe("hide_from_surge_name_1");
  });

  it("surge_task_descr should correctly return description", () => {
    replaceFunctionMock(isActorInSurgeCover, () => true);
    expect(callTaskBinding("surge_task_descr")).toBe("translated_hide_from_surge_descr_2_a");

    replaceFunctionMock(isActorInSurgeCover, () => false);
    expect(callTaskBinding("surge_task_descr")).toBe("translated_hide_from_surge_descr_1_a");
  });

  it("target_condlist should correctly return target", () => {
    mockRegisteredActor();

    const object: GameObject = MockGameObject.mock();

    registerStoryLink(object.id(), "first-sid");

    expect(callTaskBinding("target_condlist", ["a", "b", "{+test_info} first_sid, nil"])).toBeNull();

    giveInfoPortion("test_info");
    expect(callTaskBinding("target_condlist", ["a", "b", "{+test_info} first-sid, nil"])).toBe(object.id());
  });

  it("surge_task_target should correctly return target id", () => {
    replaceFunctionMock(getActorTargetSurgeCover, () => null);
    expect(callTaskBinding("surge_task_target")).toBeNull();

    const target: GameObject = MockGameObject.mock();

    replaceFunctionMock(getActorTargetSurgeCover, () => target);
    expect(callTaskBinding("surge_task_target")).toBe(target.id());
  });
});
