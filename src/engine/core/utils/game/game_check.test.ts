import { describe, expect, it } from "@jest/globals";
import { alife } from "xray16";

import { isBlackScreen, isGameLevelChanging, isGameStarted } from "@/engine/core/utils/game/game_check";
import { replaceFunctionMock } from "@/fixtures/utils";
import { MockAlifeSimulator, MockDevice, mockServerAlifeCreatureActor } from "@/fixtures/xray";
import { MockCGameGraph } from "@/fixtures/xray/mocks/CGameGraph.mock";

describe("game_check utils", () => {
  it("'isGameStarted' should check alife", () => {
    replaceFunctionMock(alife, () => null);
    expect(isGameStarted()).toBe(false);

    replaceFunctionMock(alife, MockAlifeSimulator.mock);
    expect(isGameStarted()).toBe(true);
  });

  it("'isBlackScreen' should check whether black screen is visible now", () => {
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

  it("'isGameLevelChanging' should check whether level is changing now", () => {
    const gameGraph: MockCGameGraph = MockCGameGraph.getInstance();

    replaceFunctionMock(alife, () => null);

    mockServerAlifeCreatureActor({ m_game_vertex_id: 3 });
    expect(isGameLevelChanging()).toBe(false);

    replaceFunctionMock(alife, MockAlifeSimulator.mock);

    gameGraph.vertex(10).level_id.mockImplementation(() => 5);
    mockServerAlifeCreatureActor({ m_game_vertex_id: 10 });
    expect(isGameLevelChanging()).toBe(true);

    gameGraph.vertex(15).level_id.mockImplementation(() => 3);
    mockServerAlifeCreatureActor({ m_game_vertex_id: 15 });
    expect(isGameLevelChanging()).toBe(false);

    gameGraph.vertex(20).level_id.mockImplementation(() => 10);
    mockServerAlifeCreatureActor({ m_game_vertex_id: 20 });
    expect(isGameLevelChanging()).toBe(true);
  });
});
