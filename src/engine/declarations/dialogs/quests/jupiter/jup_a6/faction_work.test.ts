import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { AnyArgs, AnyObject, TName, TSection } from "xray16/lib";
import { MockGameObject } from "xray16/mocks";
import { replaceFunctionMock, resetFunctionMock } from "xray16/testing/utils";

import { infoPortions } from "@/engine/constants/info_portions";
import { giveInfoPortion } from "@/engine/core/utils/info_portion";
import { isObjectInSmartTerrain } from "@/engine/core/utils/position";
import { callBinding, mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

jest.mock("@/engine/core/utils/position");
function callDialogsBinding<T = boolean>(name: TName, args: AnyArgs = []): T {
  return callBinding(name, args, (_G as AnyObject)["dialogs"]);
}

function resetActor(): GameObject {
  resetRegistry();

  return mockRegisteredActor().actorGameObject;
}

function checkTerrainPredicate(name: TName, terrain: TSection, expectedWhenInside: boolean): void {
  const actorGameObject: GameObject = resetActor();
  const npc: GameObject = MockGameObject.mock();

  replaceFunctionMock(isObjectInSmartTerrain, () => true);
  expect(callDialogsBinding(name, [actorGameObject, npc])).toBe(expectedWhenInside);
  expect(isObjectInSmartTerrain).toHaveBeenLastCalledWith(npc, terrain);

  replaceFunctionMock(isObjectInSmartTerrain, () => false);
  expect(callDialogsBinding(name, [actorGameObject, npc])).toBe(!expectedWhenInside);
  expect(isObjectInSmartTerrain).toHaveBeenLastCalledWith(npc, terrain);
}

beforeAll(() => require("@/engine/declarations/dialogs/quests/jupiter/jup_a6/faction_work"));

beforeEach(() => {
  resetRegistry();
  mockRegisteredActor();
  resetFunctionMock(isObjectInSmartTerrain);
});

describe("squad_in_smart_jup_b25", () => {
  // Named after b25 but bound to the jup_a6 terrain, same as the original game script.
  it("should check the jup_a6 terrain", () => {
    checkTerrainPredicate("squad_in_smart_jup_b25", "jup_a6", true);
  });
});

describe("dolg_can_work_for_sci", () => {
  it("should stay open until Freedom takes either bunker job", () => {
    expect(callDialogsBinding("dolg_can_work_for_sci")).toBe(true);

    giveInfoPortion(infoPortions.jup_a6_freedom_leader_bunker_guards_work);
    expect(callDialogsBinding("dolg_can_work_for_sci")).toBe(false);

    resetActor();

    giveInfoPortion(infoPortions.jup_a6_freedom_leader_bunker_scan_work);
    expect(callDialogsBinding("dolg_can_work_for_sci")).toBe(false);
  });

  it("should ignore the jobs taken by Duty itself", () => {
    giveInfoPortion(infoPortions.jup_a6_duty_leader_bunker_guards_work);
    giveInfoPortion(infoPortions.jup_a6_duty_leader_bunker_scan_work);

    expect(callDialogsBinding("dolg_can_work_for_sci")).toBe(true);
  });
});

describe("dolg_can_not_work_for_sci", () => {
  it("should invert the Duty bunker job availability", () => {
    expect(callDialogsBinding("dolg_can_not_work_for_sci")).toBe(false);

    giveInfoPortion(infoPortions.jup_a6_freedom_leader_bunker_guards_work);
    expect(callDialogsBinding("dolg_can_not_work_for_sci")).toBe(true);

    resetActor();

    giveInfoPortion(infoPortions.jup_a6_freedom_leader_bunker_scan_work);
    expect(callDialogsBinding("dolg_can_not_work_for_sci")).toBe(true);
  });
});

describe("freedom_can_work_for_sci", () => {
  it("should stay open until Duty takes either bunker job", () => {
    expect(callDialogsBinding("freedom_can_work_for_sci")).toBe(true);

    giveInfoPortion(infoPortions.jup_a6_duty_leader_bunker_guards_work);
    expect(callDialogsBinding("freedom_can_work_for_sci")).toBe(false);

    resetActor();

    giveInfoPortion(infoPortions.jup_a6_duty_leader_bunker_scan_work);
    expect(callDialogsBinding("freedom_can_work_for_sci")).toBe(false);
  });

  it("should ignore the jobs taken by Freedom itself", () => {
    giveInfoPortion(infoPortions.jup_a6_freedom_leader_bunker_guards_work);
    giveInfoPortion(infoPortions.jup_a6_freedom_leader_bunker_scan_work);

    expect(callDialogsBinding("freedom_can_work_for_sci")).toBe(true);
  });
});

describe("freedom_can_not_work_for_sci", () => {
  it("should invert the Freedom bunker job availability", () => {
    expect(callDialogsBinding("freedom_can_not_work_for_sci")).toBe(false);

    giveInfoPortion(infoPortions.jup_a6_duty_leader_bunker_guards_work);
    expect(callDialogsBinding("freedom_can_not_work_for_sci")).toBe(true);

    resetActor();

    giveInfoPortion(infoPortions.jup_a6_duty_leader_bunker_scan_work);
    expect(callDialogsBinding("freedom_can_not_work_for_sci")).toBe(true);
  });
});
