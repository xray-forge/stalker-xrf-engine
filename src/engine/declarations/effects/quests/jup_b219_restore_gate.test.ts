import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockAlifeObject, MockAlifeObjectPhysic, MockAlifeSimulator, MockGameObject } from "xray16/mocks";

import { registerSimulator, registerStoryLink, registry } from "@/engine/core/database";
import { callXrEffect, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/quests/jup_b219_save_pos");
  require("@/engine/declarations/effects/quests/jup_b219_restore_gate");
});

beforeEach(() => {
  resetRegistry();
});

describe("jup_b219_restore_gate", () => {
  it("should recreate a saved gate with its original positioning", () => {
    const gate: GameObject = MockGameObject.mock({ levelVertexId: 25, gameVertexId: 44 });
    const serverGate = MockAlifeObject.mock({ id: gate.id() });
    const restoredGate = MockAlifeObjectPhysic.mock();

    registerSimulator();
    MockAlifeSimulator.addToRegistry(serverGate);
    registerStoryLink(gate.id(), "jup_b219_gate_id");
    jest.spyOn(restoredGate, "set_yaw");
    jest.spyOn(registry.simulator, "create").mockReturnValue(restoredGate);

    callXrEffect("jup_b219_save_pos", MockGameObject.mockActor(), MockGameObject.mock());
    callXrEffect("jup_b219_restore_gate", MockGameObject.mockActor(), MockGameObject.mock());

    expect(registry.simulator.create).toHaveBeenCalledWith("jup_b219_gate", gate.position(), 25, 44);
    expect(restoredGate.set_yaw).toHaveBeenCalledWith(0);
  });
});
