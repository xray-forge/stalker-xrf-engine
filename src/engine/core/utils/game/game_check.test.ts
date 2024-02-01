import { describe, expect, it } from "@jest/globals";

import { registerActorServer, registerSimulator, registry } from "@/engine/core/database";
import { Actor } from "@/engine/core/objects/creature";
import { isBlackScreen, isGameLevelChanging, isGameStarted } from "@/engine/core/utils/game/game_check";
import { AlifeSimulator } from "@/engine/lib/types";
import { MockAlifeCreatureActor, MockDevice } from "@/fixtures/xray";
import { MockCGameGraph } from "@/fixtures/xray/mocks/CGameGraph.mock";

describe("isGameStarted util", () => {
  it("should check alife", () => {
    registry.simulator = null as unknown as AlifeSimulator;
    expect(isGameStarted()).toBe(false);

    registerSimulator();
    expect(isGameStarted()).toBe(true);
  });
});

describe("isBlackScreen util", () => {
  it("should check whether black screen is visible now", () => {
    expect(isBlackScreen()).toBe(false);

    const device: MockDevice = MockDevice.getInstance();

    device.precache_frame = 10;
    expect(isBlackScreen()).toBe(true);
    device.precache_frame = 1;
    expect(isBlackScreen()).toBe(false);
    device.precache_frame = 1000;
    expect(isBlackScreen()).toBe(true);
    device.precache_frame = 0;
    expect(isBlackScreen()).toBe(false);
  });
});

describe("isGameLevelChanging util", () => {
  it("should check whether level is changing now", () => {
    const gameGraph: MockCGameGraph = MockCGameGraph.getInstance();

    registry.simulator = null as unknown as AlifeSimulator;
    registerActorServer(MockAlifeCreatureActor.mock({ gameVertexId: 3 }) as Actor);
    expect(isGameLevelChanging()).toBe(false);

    gameGraph.vertex(10).level_id.mockImplementation(() => 5);
    registerActorServer(MockAlifeCreatureActor.mock({ gameVertexId: 10 }) as Actor);
    registerSimulator();
    expect(isGameLevelChanging()).toBe(true);

    gameGraph.vertex(15).level_id.mockImplementation(() => 3);
    registerActorServer(MockAlifeCreatureActor.mock({ gameVertexId: 15 }) as Actor);
    registerSimulator();
    expect(isGameLevelChanging()).toBe(false);

    gameGraph.vertex(20).level_id.mockImplementation(() => 10);
    registerActorServer(MockAlifeCreatureActor.mock({ gameVertexId: 20 }) as Actor);
    registerSimulator();
    expect(isGameLevelChanging()).toBe(true);
  });
});
