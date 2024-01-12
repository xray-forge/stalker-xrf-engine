import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { AbstractScheme } from "@/engine/core/ai/scheme/AbstractScheme";
import { IBaseSchemeState, IRegistryObjectState, registerObject } from "@/engine/core/database";
import { loadSchemeImplementation } from "@/engine/core/utils/scheme";
import { AnyObject, EScheme, ESchemeType, GameObject, IniFile, TSection } from "@/engine/lib/types";
import { mockSchemeState, resetRegistry } from "@/fixtures/engine";
import { MockGameObject, MockIniFile } from "@/fixtures/xray";

describe("AbstractScheme class", () => {
  class ExampleAbstractScheme extends AbstractScheme {
    public static override readonly SCHEME_SECTION: EScheme = EScheme.PH_CODE;
    public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.OBJECT;
  }

  class ExampleScheme extends AbstractScheme {
    public static override readonly SCHEME_SECTION: EScheme = EScheme.PH_CODE;
    public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.OBJECT;

    public static override activate(
      object: GameObject,
      ini: IniFile,
      scheme: EScheme,
      section: TSection
    ): IBaseSchemeState {
      return AbstractScheme.assign(object, ini, scheme, section);
    }

    public static override add = jest.fn();
  }

  beforeEach(() => {
    resetRegistry();
  });

  it("should have section and type", () => {
    expect(ExampleAbstractScheme.SCHEME_SECTION).toBe(EScheme.PH_CODE);
    expect(ExampleAbstractScheme.SCHEME_TYPE).toBe(ESchemeType.OBJECT);
  });

  it("should throw exceptions if base methods are not overrode", () => {
    const object: GameObject = MockGameObject.mock();
    const ini: IniFile = MockIniFile.mock("test.ltx");
    const state: IBaseSchemeState = mockSchemeState(EScheme.PH_CODE);
    const objectState: IRegistryObjectState = registerObject(object);

    expect(() => ExampleAbstractScheme.activate(object, ini, EScheme.PH_CODE, "ph_code@test")).toThrow(
      `Called not implemented 'activate' method: '${object.name()}', 'ph_code', 'ph_code@test'.`
    );

    expect(() => ExampleAbstractScheme.add(object, ini, EScheme.PH_CODE, "ph_code@test", state)).toThrow(
      `Called not implemented 'add' method: '${object.name()}', 'ph_code', 'ph_code@test'.`
    );

    expect(() => ExampleAbstractScheme.reset(object, EScheme.PH_CODE, objectState, "ph_code@test")).toThrow(
      `Called not implemented 'reset' method: '${object.name()}', 'ph_code', 'ph_code@test'.`
    );
    expect(() => ExampleAbstractScheme.disable(object, EScheme.PH_CODE)).toThrow(
      `Called not implemented 'disable' method: '${object.name()}', 'ph_code'.`
    );
  });

  it("should handle assign method", () => {
    const object: GameObject = MockGameObject.mock();
    const ini: IniFile = MockIniFile.mock("test.ltx");
    const state: IRegistryObjectState = registerObject(object);

    loadSchemeImplementation(ExampleScheme);

    const schemeState: IBaseSchemeState = ExampleScheme.activate(object, ini, EScheme.PH_CODE, "ph_code@example");

    expect(ExampleScheme.add).toHaveBeenCalledTimes(1);
    expect(ExampleScheme.add).toHaveBeenCalledWith(object, ini, EScheme.PH_CODE, "ph_code@example", schemeState);

    expect(state[EScheme.PH_CODE]).toBe(schemeState);
    expect(schemeState).toEqual({ ini, scheme: EScheme.PH_CODE, section: "ph_code@example" });
  });

  it("should handle subscribe/unsubscribe for provided states", () => {
    const state: IBaseSchemeState = mockSchemeState(EScheme.PH_CODE);

    const first: AnyObject = {};
    const second: AnyObject = {};

    expect(state.actions).toBeNull();

    AbstractScheme.unsubscribe(state, first);
    AbstractScheme.unsubscribe(state, second);

    expect(state.actions).toBeNull();

    AbstractScheme.subscribe(state, first);

    expect(state.actions).toBeInstanceOf(LuaTable);
    expect(state.actions?.length()).toBe(1);
    expect(state.actions?.get(first)).toBe(true);

    AbstractScheme.subscribe(state, second);

    expect(state.actions?.length()).toBe(2);
    expect(state.actions?.get(second)).toBe(true);

    AbstractScheme.unsubscribe(state, second);

    expect(state.actions?.length()).toBe(1);
    expect(state.actions?.get(first)).toBe(true);
    expect(state.actions?.get(second)).toBeNull();

    AbstractScheme.unsubscribe(state, first);

    expect(state.actions?.length()).toBe(0);
  });
});
