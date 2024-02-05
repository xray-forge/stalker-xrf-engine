import { describe, expect, it, jest } from "@jest/globals";
import { cond, move, vector } from "xray16";

import {
  isMonsterScriptCaptured,
  resetMonsterAction,
  scriptCaptureMonster,
  scriptCommandMonster,
  scriptReleaseMonster,
} from "@/engine/core/utils/scheme/scheme_monster";
import { Cond, GameObject, Move } from "@/engine/lib/types";
import { getFunctionMock, replaceFunctionMock, resetFunctionMock } from "@/fixtures/jest";
import { MockEntityAction, MockGameObject } from "@/fixtures/xray";

describe("isMonsterScriptCaptured util", () => {
  it("should correctly check if monster object is captured", () => {
    const object: GameObject = MockGameObject.mock();

    expect(isMonsterScriptCaptured(object)).toBe(false);
    replaceFunctionMock(object.get_script, () => true);
    expect(isMonsterScriptCaptured(object)).toBe(true);
  });
});

describe("resetMonsterAction util", () => {
  it("should correctly reset action", () => {
    const object: GameObject = MockGameObject.mock();

    replaceFunctionMock(object.get_script, () => true);
    replaceFunctionMock(object.get_script_name, () => "test-script");

    resetMonsterAction(object, "another-script");

    expect(object.script).toHaveBeenCalledTimes(2);
    expect(object.script).toHaveBeenNthCalledWith(1, false, "test-script");
    expect(object.script).toHaveBeenNthCalledWith(2, true, "another-script");

    resetFunctionMock(object.script);

    replaceFunctionMock(object.get_script, () => false);
    resetMonsterAction(object, "xrf");
    expect(object.script).toHaveBeenCalledWith(true, "xrf");
  });
});

describe("scriptCaptureMonster util", () => {
  it("should correctly capture monster script logic when resetting", () => {
    const object: GameObject = MockGameObject.mock();

    replaceFunctionMock(object.get_script, () => true);
    replaceFunctionMock(object.get_script_name, () => "test-script");
    scriptCaptureMonster(object, true, "another-script");

    expect(object.script).toHaveBeenCalledTimes(2);
    expect(object.script).toHaveBeenNthCalledWith(1, false, "test-script");
    expect(object.script).toHaveBeenNthCalledWith(2, true, "another-script");

    resetFunctionMock(object.script);

    replaceFunctionMock(object.get_script, () => false);
    scriptCaptureMonster(object, true);

    expect(object.script).toHaveBeenCalledWith(true, "xrf");
  });

  it("should correctly capture monster script logic when not resetting", () => {
    const object: GameObject = MockGameObject.mock();

    // No reset, no script active.
    jest.spyOn(object, "get_script").mockImplementation(() => true);

    scriptCaptureMonster(object, false, "xrf-test-0");

    expect(object.script).not.toHaveBeenCalled();

    // No reset, with script active.
    jest.spyOn(object, "get_script").mockImplementation(() => false);

    scriptCaptureMonster(object, false, "xrf-test-1");

    expect(object.script).toHaveBeenCalledWith(true, "xrf-test-1");

    // Reset.
    jest.spyOn(object, "get_script").mockImplementation(() => true);
    jest.spyOn(object, "get_script_name").mockImplementation(() => "xrf-test-2-before");

    scriptCaptureMonster(object, true, "xrf-test-2");

    expect(object.script).toHaveBeenCalledWith(false, "xrf-test-2-before");
    expect(object.script).toHaveBeenCalledWith(true, "xrf-test-2");
  });
});

describe("scriptReleaseMonster util", () => {
  it("should correctly release monster script logic", () => {
    const object: GameObject = MockGameObject.mock();

    scriptReleaseMonster(object);

    expect(object.get_script).toHaveBeenCalledTimes(1);
    expect(object.script).not.toHaveBeenCalled();

    replaceFunctionMock(object.get_script, () => true);
    replaceFunctionMock(object.get_script_name, () => "test_name");

    scriptReleaseMonster(object);

    expect(object.get_script).toHaveBeenCalledTimes(2);
    expect(object.get_script_name).toHaveBeenCalled();
    expect(object.script).toHaveBeenCalledWith(false, "test_name");
  });
});

describe("scriptCommandMonster util", () => {
  it("should correctly assign actions", () => {
    const object: GameObject = MockGameObject.mock();
    const moveAction: Move = new move(move.run_with_leader, new vector().set(1, 2, 3));
    const condAction: Cond = new cond(cond.move_end);

    scriptCommandMonster(object, moveAction, condAction);
    expect(object.command).toHaveBeenCalledTimes(1);

    const entityAction: MockEntityAction = getFunctionMock(object.command).mock.calls[0][0] as MockEntityAction;

    expect(entityAction.set_action).toHaveBeenCalledTimes(2);
    expect(entityAction.set_action).toHaveBeenNthCalledWith(1, moveAction);
    expect(entityAction.set_action).toHaveBeenNthCalledWith(2, condAction);
  });
});
