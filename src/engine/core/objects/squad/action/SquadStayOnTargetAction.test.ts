import { describe, expect, it, jest } from "@jest/globals";
import { CTime, game } from "xray16";

import { SquadStayOnTargetAction } from "@/engine/core/objects/squad/action/SquadStayOnTargetAction";
import { ESquadActionType } from "@/engine/core/objects/squad/squad_types";
import { MockSquad } from "@/fixtures/engine";
import { MockCTime } from "@/fixtures/xray";

describe("SquadStayOnTargetAction class", () => {
  it("should correctly initialize", () => {
    const squad: MockSquad = MockSquad.mock();
    const action: SquadStayOnTargetAction = new SquadStayOnTargetAction(squad);

    expect(action.squad).toBe(squad);
    expect(action.type).toBe(ESquadActionType.STAY_ON_TARGET);
    expect(action.actionStartTime).toBeNull();
    expect(typeof action.actionIdleTime).toBe("number");

    action.initialize();

    expect(MockCTime.areEqual(action.actionStartTime as CTime, game.get_game_time())).toBe(true);
  });

  it("should correctly finalize", () => {
    const squad: MockSquad = MockSquad.mock();
    const action: SquadStayOnTargetAction = new SquadStayOnTargetAction(squad);

    action.initialize();

    expect(() => action.finalize()).not.toThrow();
  });

  it("should correctly update / check state", () => {
    const squad: MockSquad = MockSquad.mock();
    const action: SquadStayOnTargetAction = new SquadStayOnTargetAction(squad);

    action.initialize();

    expect(action.update()).toBe(false);

    jest.spyOn(action.actionStartTime as CTime, "diffSec").mockImplementation(() => 0);
    expect(action.update()).toBe(false);

    jest.spyOn(action.actionStartTime as CTime, "diffSec").mockImplementation(() => action.actionIdleTime);
    expect(action.update()).toBe(false);

    jest.spyOn(action.actionStartTime as CTime, "diffSec").mockImplementation(() => action.actionIdleTime + 1);
    expect(action.update()).toBe(true);
  });

  it("should correctly calculate stay idle duration", () => {
    const squad: MockSquad = MockSquad.mock();
    const action: SquadStayOnTargetAction = new SquadStayOnTargetAction(squad);

    action.initialize();

    expect(action.getStayIdleDuration()).toBe(action.actionIdleTime);
  });
});
