import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { AnyArgs, AnyObject, TName } from "xray16/lib";
import { MockGameObject } from "xray16/mocks";
import { replaceFunctionMock } from "xray16/testing/utils";

import { registerStoryLink } from "@/engine/core/database/story_objects";
import { getActorTargetSurgeCover, isActorInSurgeCover } from "@/engine/core/managers/surge/utils/surge_cover";
import { giveInfoPortion } from "@/engine/core/utils/info_portion";
import { callBinding, mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

function callTaskBinding(name: TName, args: AnyArgs = []): unknown {
  return callBinding(name, args, (_G as AnyObject).task_functors);
}

jest.mock("@/engine/core/managers/surge/utils/surge_cover", () => ({
  isActorInSurgeCover: jest.fn(() => true),
  getActorTargetSurgeCover: jest.fn(() => null),
}));

beforeAll(() => {
  require("@/engine/declarations/tasks/task_functors");
});

beforeEach(() => {
  resetRegistry();
});

describe("condlist", () => {
  it("should parse condition list from parameters", () => {
    mockRegisteredActor();
    expect(callTaskBinding("condlist", ["a", "b", "{+test_info} first, second"])).toBe("second");

    giveInfoPortion("test_info");
    expect(callTaskBinding("condlist", ["a", "b", "{+test_info} first, second"])).toBe("first");
  });
});

describe("surge_task_title", () => {
  it("should correctly return title", () => {
    replaceFunctionMock(isActorInSurgeCover, () => true);
    expect(callTaskBinding("surge_task_title")).toBe("hide_from_surge_name_2");

    replaceFunctionMock(isActorInSurgeCover, () => false);
    expect(callTaskBinding("surge_task_title")).toBe("hide_from_surge_name_1");
  });
});

describe("surge_task_descr", () => {
  it("should correctly return description", () => {
    replaceFunctionMock(isActorInSurgeCover, () => true);
    expect(callTaskBinding("surge_task_descr")).toBe("translated_hide_from_surge_descr_2_a");

    replaceFunctionMock(isActorInSurgeCover, () => false);
    expect(callTaskBinding("surge_task_descr")).toBe("translated_hide_from_surge_descr_1_a");
  });
});

describe("target_condlist", () => {
  it("should correctly return target", () => {
    mockRegisteredActor();

    const object: GameObject = MockGameObject.mock();

    registerStoryLink(object.id(), "first-sid");

    expect(callTaskBinding("target_condlist", ["a", "b", "{+test_info} first_sid, nil"])).toBeNull();

    giveInfoPortion("test_info");
    expect(callTaskBinding("target_condlist", ["a", "b", "{+test_info} first-sid, nil"])).toBe(object.id());
  });
});

describe("surge_task_target", () => {
  it("should correctly return target id", () => {
    replaceFunctionMock(getActorTargetSurgeCover, () => null);
    expect(callTaskBinding("surge_task_target")).toBeNull();

    const target: GameObject = MockGameObject.mock();

    replaceFunctionMock(getActorTargetSurgeCover, () => target);
    expect(callTaskBinding("surge_task_target")).toBe(target.id());
  });
});
