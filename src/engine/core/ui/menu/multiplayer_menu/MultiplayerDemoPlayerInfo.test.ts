import { describe, expect, it } from "@jest/globals";

import { MultiplayerDemoPlayerInfo } from "@/engine/core/ui/menu/multiplayer_menu/MultiplayerDemoPlayerInfo";

describe("MultiplayerDemoPlayerInfo", () => {
  it("should correctly initialize", () => {
    const playerInfo: MultiplayerDemoPlayerInfo = new MultiplayerDemoPlayerInfo();

    expect(playerInfo.name).toBe("unknown_player");
    expect(playerInfo.death).toBe(0);
    expect(playerInfo.artefacts).toBe(0);
    expect(playerInfo.team).toBe(0);
    expect(playerInfo.rank).toBe(0);
    expect(playerInfo.frags).toBe(0);
    expect(playerInfo.spots).toBe(0);
  });
});
