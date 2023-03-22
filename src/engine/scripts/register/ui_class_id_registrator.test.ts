import { describe, expect, it } from "@jest/globals";

import { gameClassId } from "@/engine/lib/constants/class_ids";
import { EGameType } from "@/engine/lib/constants/game_types";
import { getUiClassId } from "@/engine/scripts/register/ui_class_id_registrator";

describe("'ui_class_id_registrator' entry point", () => {
  it("'getUiClassId' should correctly return matching game class id", () => {
    expect(getUiClassId(EGameType.SINGLE)).toBe(gameClassId.UI_SINGL);
    expect(getUiClassId(EGameType.CAPTURE_THE_ARTEFACT)).toBe(gameClassId.UI_CTA);
    expect(getUiClassId(EGameType.ARTEFACT_HUNT)).toBe(gameClassId.UI_AHUNT);
    expect(getUiClassId(EGameType.DEATH_MATCH)).toBe(gameClassId.UI_DM);
    expect(getUiClassId(EGameType.TEAM_DEATH_MATCH)).toBe(gameClassId.UI_TDM);
  });

  it("'getUiClassId' should crash on unexpected values", () => {
    expect(() => getUiClassId("test" as unknown as EGameType)).toThrow();
  });
});
