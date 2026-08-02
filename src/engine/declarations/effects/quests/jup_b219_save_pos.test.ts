import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockAlifeObject, MockAlifeSimulator, MockGameObject } from "xray16/mocks";

import { registerSimulator, registerStoryLink, registry } from "@/engine/core/database";
import { callXrEffect, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/quests/jup_b219_save_pos");
});

beforeEach(() => {
  resetRegistry();
});

describe("jup_b219_save_pos", () => {
  it("should retain the gate position and release its server object", () => {
    const gate: GameObject = MockGameObject.mock();
    const serverGate = MockAlifeObject.mock({ id: gate.id() });

    registerSimulator();
    MockAlifeSimulator.addToRegistry(serverGate);
    registerStoryLink(gate.id(), "jup_b219_gate_id");

    callXrEffect("jup_b219_save_pos", MockGameObject.mockActor(), MockGameObject.mock());

    expect(registry.simulator.release).toHaveBeenCalledWith(serverGate, true);
  });
});
