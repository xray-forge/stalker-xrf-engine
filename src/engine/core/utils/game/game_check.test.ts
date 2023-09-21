import { describe, expect, it } from "@jest/globals";

import { registerActorServer, registerSimulator, registry } from "@/engine/core/database";
import { Actor } from "@/engine/core/objects/server/creature";
import { isBlackScreen, isGameLevelChanging, isGameStarted } from "@/engine/core/utils/game/game_check";
import { AlifeSimulator } from "@/engine/lib/types";
import { MockDevice, mockServerAlifeCreatureActor } from "@/fixtures/xray";
import { MockCGameGraph } from "@/fixtures/xray/mocks/CGameGraph.mock";

describe("game_check utils", () => {
  it("isGameStarted should check alife", () => {
    registry.simulator = null as unknown as AlifeSimulator;
    expect(isGameStarted()).toBe(false);

    registerSimulator();
    expect(isGameStarted()).toBe(true);
  });

  it("isBlackScreen should check whether black screen is visible now", () => {
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

  it("isGameLevelChanging should check whether level is changing now", () => {
    const gameGraph: MockCGameGraph = MockCGameGraph.getInstance();

    registry.simulator = null as unknown as AlifeSimulator;
    registerActorServer(mockServerAlifeCreatureActor({ m_game_vertex_id: 3 }) as Actor);
    expect(isGameLevelChanging()).toBe(false);

    gameGraph.vertex(10).level_id.mockImplementation(() => 5);
    registerActorServer(mockServerAlifeCreatureActor({ m_game_vertex_id: 10 }) as Actor);
    registerSimulator();
    expect(isGameLevelChanging()).toBe(true);

    gameGraph.vertex(15).level_id.mockImplementation(() => 3);
    registerActorServer(mockServerAlifeCreatureActor({ m_game_vertex_id: 15 }) as Actor);
    registerSimulator();
    expect(isGameLevelChanging()).toBe(false);

    gameGraph.vertex(20).level_id.mockImplementation(() => 10);
    registerActorServer(mockServerAlifeCreatureActor({ m_game_vertex_id: 20 }) as Actor);
    registerSimulator();
    expect(isGameLevelChanging()).toBe(true);
  });
});
