import { describe, expect, it } from "@jest/globals";

import {
  isMonsterScriptCaptured,
  scriptCaptureMonster,
  scriptReleaseMonster,
} from "@/engine/core/utils/scheme/monster";
import { ClientObject } from "@/engine/lib/types";
import { replaceFunctionMock, resetFunctionMock } from "@/fixtures/utils";
import { mockClientGameObject } from "@/fixtures/xray";

describe("'monster' scheme utils", () => {
  it("should correctly check if monster object is captured", () => {
    const object: ClientObject = mockClientGameObject();

    expect(isMonsterScriptCaptured(object)).toBe(false);
    replaceFunctionMock(object.get_script, () => true);
    expect(isMonsterScriptCaptured(object)).toBe(true);
  });

  it("should correctly capture monster script logic when resetting", () => {
    const object: ClientObject = mockClientGameObject();

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
    const object: ClientObject = mockClientGameObject();

    replaceFunctionMock(object.get_script, () => true);
    scriptCaptureMonster(object, false);
    expect(object.script).not.toHaveBeenCalled();

    replaceFunctionMock(object.get_script, () => false);
    scriptCaptureMonster(object, true);
    expect(object.script).toHaveBeenCalledWith(true, "xrf");
  });

  it("should correctly release monster script logic", () => {
    const object: ClientObject = mockClientGameObject();

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
