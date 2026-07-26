import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { $fromObject } from "xray16/macros";
import { MockGameObject } from "xray16/mocks";
import { resetFunctionMock } from "xray16/testing/utils";

import { IdleController } from "@/engine/core/schemes/restrictor/sr_idle/IdleController";
import { ISchemeIdleState } from "@/engine/core/schemes/restrictor/sr_idle/sr_idle_types";
import { trySwitchToAnotherSection } from "@/engine/core/schemes/runtime";
import { EScheme } from "@/engine/core/schemes/types";
import { mockSchemeState, resetRegistry } from "@/fixtures/engine";

jest.mock("@/engine/core/schemes/runtime/scheme_switch", () => ({
  trySwitchToAnotherSection: jest.fn(() => false),
}));

describe("IdleController", () => {
  beforeEach(() => {
    resetRegistry();
    resetFunctionMock(trySwitchToAnotherSection);
  });

  it("should reset signals on activation", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeIdleState = mockSchemeState<ISchemeIdleState>(EScheme.SR_IDLE, {
      signals: $fromObject<string, boolean>({ test: true }),
    });
    const controller: IdleController = new IdleController(object, state);

    controller.activate();

    expect(state.signals).toEqualLuaTables({});
  });

  it("should only try switching section on update", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeIdleState = mockSchemeState<ISchemeIdleState>(EScheme.SR_IDLE);
    const controller: IdleController = new IdleController(object, state);

    controller.update(100);

    expect(trySwitchToAnotherSection).toHaveBeenCalledTimes(1);
    expect(trySwitchToAnotherSection).toHaveBeenCalledWith(object, state);
  });
});
