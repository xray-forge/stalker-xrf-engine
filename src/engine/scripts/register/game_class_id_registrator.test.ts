import { describe, expect, it } from "@jest/globals";

import { gameClassId } from "@/engine/lib/constants/class_ids";
import { EGameType } from "@/engine/lib/constants/game_types";
import { getGameClassId } from "@/engine/scripts/register/game_class_id_registrator";

describe("game_class_id_registrator entry point", () => {
  it("getGameClassId should correctly return matching game class id", () => {
    expect(getGameClassId(EGameType.SINGLE, true)).toBe(gameClassId.SV_SINGL);
    expect(getGameClassId(EGameType.CAPTURE_THE_ARTEFACT, true)).toBe(gameClassId.SV_CTA);
    expect(getGameClassId(EGameType.ARTEFACT_HUNT, true)).toBe(gameClassId.SV_AHUNT);
    expect(getGameClassId(EGameType.DEATH_MATCH, true)).toBe(gameClassId.SV_DM);
    expect(getGameClassId(EGameType.TEAM_DEATH_MATCH, true)).toBe(gameClassId.SV_TDM);

    expect(getGameClassId(EGameType.SINGLE, false)).toBe(gameClassId.CL_SINGL);
    expect(getGameClassId(EGameType.CAPTURE_THE_ARTEFACT, false)).toBe(gameClassId.CL_CTA);
    expect(getGameClassId(EGameType.ARTEFACT_HUNT, false)).toBe(gameClassId.CL_AHUNT);
    expect(getGameClassId(EGameType.DEATH_MATCH, false)).toBe(gameClassId.CL_DM);
    expect(getGameClassId(EGameType.TEAM_DEATH_MATCH, false)).toBe(gameClassId.CL_TDM);
  });

  it("getGameClassId should crash on unexpected values", () => {
    expect(() => getGameClassId("test" as unknown as EGameType, true)).toThrow();
    expect(() => getGameClassId("test" as unknown as EGameType, false)).toThrow();
    expect(() => getGameClassId(EGameType.SINGLE, 1 as unknown as boolean)).toThrow();
    expect(() => getGameClassId(EGameType.SINGLE, null as unknown as boolean)).toThrow();
  });
});
