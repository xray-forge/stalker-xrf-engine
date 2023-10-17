import { describe, expect, it, jest } from "@jest/globals";

import { CodeManager } from "@/engine/core/schemes/physical/ph_code/CodeManager";
import { ISchemeCodeState } from "@/engine/core/schemes/physical/ph_code/ph_code_types";
import { extern } from "@/engine/core/utils/binding";
import { parseConditionsList, TConditionList } from "@/engine/core/utils/ini";
import { EScheme, GameObject, TName } from "@/engine/lib/types";
import { mockBaseSchemeLogic, mockSchemeState } from "@/fixtures/engine";
import { mockGameObject } from "@/fixtures/xray";

describe("CodeManager", () => {
  it("should correctly activate", () => {
    const object: GameObject = mockGameObject();
    const state: ISchemeCodeState = mockSchemeState(EScheme.PH_CODE);
    const manager: CodeManager = new CodeManager(object, state);

    manager.activate();

    expect(object.set_nonscript_usable).toHaveBeenCalledWith(false);
  });

  it("should correctly deactivate", () => {
    const object: GameObject = mockGameObject();
    const state: ISchemeCodeState = mockSchemeState(EScheme.PH_CODE);
    const manager: CodeManager = new CodeManager(object, state);

    manager.deactivate();

    expect(object.set_tip_text).toHaveBeenCalledWith("");
  });

  it("should handle usage with no exceptions", () => {
    const object: GameObject = mockGameObject();
    const state: ISchemeCodeState = mockSchemeState(EScheme.PH_CODE);
    const manager: CodeManager = new CodeManager(object, state);

    expect(() => manager.onUse()).not.toThrow();
  });

  it("should handle number callback when have code", () => {
    const object: GameObject = mockGameObject();
    const state: ISchemeCodeState = mockSchemeState<ISchemeCodeState>(EScheme.PH_CODE, {
      code: 123,
      onCode: mockBaseSchemeLogic({
        condlist: parseConditionsList("{+test} first %=first%, second %=second%"),
      }),
    });

    const manager: CodeManager = new CodeManager(object, state);

    const first = jest.fn();
    const second = jest.fn();

    extern("xr_effects.first", first);
    extern("xr_effects.second", second);

    manager.onNumberReceive("12");
    expect(first).not.toHaveBeenCalled();
    expect(second).not.toHaveBeenCalled();

    manager.onNumberReceive("123");
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalled();
  });

  it("should handle number callback when have check", () => {
    const object: GameObject = mockGameObject();
    const state: ISchemeCodeState = mockSchemeState<ISchemeCodeState>(EScheme.PH_CODE, {
      onCheckCode: $fromObject<TName, TConditionList>({
        x443: parseConditionsList("{} first %=first%"),
        x123: parseConditionsList("{} second %=second%"),
      }),
    });

    const manager: CodeManager = new CodeManager(object, state);

    const first = jest.fn();
    const second = jest.fn();

    extern("xr_effects.first", first);
    extern("xr_effects.second", second);

    manager.onNumberReceive("x12");
    expect(first).not.toHaveBeenCalled();
    expect(second).not.toHaveBeenCalled();

    manager.onNumberReceive("x123");
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalled();

    manager.onNumberReceive("x443");
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
  });
});
