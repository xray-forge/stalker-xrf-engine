import { describe, expect, it } from "@jest/globals";
import { clsid } from "xray16";

import { getMonsterState, setMonsterState } from "@/engine/core/database/monster";
import { EMonsterState } from "@/engine/lib/constants/monsters";
import { GameObject } from "@/engine/lib/types";
import { resetFunctionMock } from "@/fixtures/jest";
import { MockGameObject, MockIniFile } from "@/fixtures/xray";

describe("monster database module", () => {
  it("should correctly read monster state from ini", () => {
    expect(getMonsterState(MockIniFile.mock("test.ltx", { a: { state: EMonsterState.INVISIBLE } }), "a")).toBe(
      EMonsterState.INVISIBLE
    );
    expect(getMonsterState(MockIniFile.mock("test.ltx", { b: { state: EMonsterState.VISIBLE } }), "b")).toBe(
      EMonsterState.VISIBLE
    );
    expect(getMonsterState(MockIniFile.mock("test.ltx", { c: { state: EMonsterState.NONE } }), "c")).toBeNull();
    expect(getMonsterState(MockIniFile.mock("test.ltx"), "test")).toBeNull();
  });

  it("should correctly set monster state", () => {
    const monster: GameObject = MockGameObject.mock();

    setMonsterState(monster, null);
    setMonsterState(monster, EMonsterState.NONE);

    expect(monster.set_invisible).not.toHaveBeenCalled();

    expect(() => setMonsterState(monster, EMonsterState.INVISIBLE)).toThrow();
    expect(() => setMonsterState(monster, EMonsterState.VISIBLE)).toThrow();
    expect(() => setMonsterState(monster, "SOMETHING" as EMonsterState)).toThrow();

    const bloodsucker: GameObject = MockGameObject.mock({ clsid: clsid.bloodsucker_s });

    setMonsterState(bloodsucker, EMonsterState.VISIBLE);
    expect(bloodsucker.set_invisible).toHaveBeenCalledWith(false);

    resetFunctionMock(bloodsucker.set_invisible);

    setMonsterState(bloodsucker, EMonsterState.INVISIBLE);
    expect(bloodsucker.set_invisible).toHaveBeenCalledWith(true);

    expect(() => setMonsterState(bloodsucker, "SOMETHING" as EMonsterState)).toThrow();
  });
});
