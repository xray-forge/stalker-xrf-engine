import { beforeEach, describe, expect, it } from "@jest/globals";

import { registerSimulator } from "@/engine/core/database";
import { GAME_MAPS_SINGLE_LTX } from "@/engine/core/managers/simulation/SimulationConfig";
import { initializeLevelSimulationGroupIds } from "@/engine/core/managers/simulation/utils/simulation_ini";
import { destroySimulationData } from "@/engine/core/managers/simulation/utils/simulation_initialization";
import { resetRegistry } from "@/fixtures/engine";
import { MockIniFile } from "@/fixtures/xray";

describe("initializeLevelSimulationGroupIds util", () => {
  beforeEach(() => {
    resetRegistry();
    registerSimulator();
    destroySimulationData();
  });

  it("should correctly initialize with default maps ltx", async () => {
    expect(
      initializeLevelSimulationGroupIds(
        MockIniFile.mock("test.ltx", {
          agroprom: 128,
          agroprom_underground: 129,
          darkvalley: 130,
          escape: 131,
          garbage: 132,
          hospital: 133,
          jupiter: 134,
          jupiter_underground: 135,
          labx8: 136,
          limansk: 137,
          marsh: 138,
          military: 139,
          pripyat: 140,
          red_forest: 141,
          stancia_2: 142,
          yantar: 143,
          zaton: 144,
        })
      )
    ).toEqualLuaTables({
      agroprom: 128,
      agroprom_underground: 129,
      darkvalley: 130,
      escape: 131,
      garbage: 132,
      hospital: 133,
      jupiter: 134,
      jupiter_underground: 135,
      labx8: 136,
      limansk: 137,
      marsh: 138,
      military: 139,
      pripyat: 140,
      red_forest: 141,
      stancia_2: 142,
      yantar: 143,
      zaton: 144,
    });

    expect(initializeLevelSimulationGroupIds(GAME_MAPS_SINGLE_LTX)).toEqualLuaTables({
      agroprom: 128,
      agroprom_underground: 129,
      darkvalley: 130,
      escape: 131,
      garbage: 132,
      hospital: 133,
      jupiter: 3,
      jupiter_underground: 5,
      labx8: 4,
      limansk: 134,
      marsh: 135,
      military: 136,
      pripyat: 2,
      red_forest: 137,
      stancia_2: 138,
      yantar: 139,
      zaton: 1,
    });
  });

  it("should throw exception on IDs out of 1-255 range", () => {
    expect(() => {
      initializeLevelSimulationGroupIds(
        MockIniFile.mock("test.ltx", {
          agroprom: {
            simulation_group_id: -100,
          },
        })
      );
    }).toThrow("[JEST_TEST] Failed to assign level 'agroprom' group id '-100', it is not in range [1:255].");

    expect(() => {
      initializeLevelSimulationGroupIds(
        MockIniFile.mock("test.ltx", {
          agroprom: {
            simulation_group_id: -1,
          },
        })
      );
    }).toThrow("[JEST_TEST] Failed to assign level 'agroprom' group id '-1', it is not in range [1:255].");

    expect(() => {
      initializeLevelSimulationGroupIds(
        MockIniFile.mock("test.ltx", {
          agroprom: {
            simulation_group_id: 0,
          },
        })
      );
    }).toThrow("[JEST_TEST] Failed to assign level 'agroprom' group id '0', it is not in range [1:255].");

    expect(() => {
      initializeLevelSimulationGroupIds(
        MockIniFile.mock("test.ltx", {
          agroprom: {
            simulation_group_id: 255,
          },
        })
      );
    }).toThrow("[JEST_TEST] Failed to assign level 'agroprom' group id '255', it is not in range [1:255].");

    expect(() => {
      initializeLevelSimulationGroupIds(
        MockIniFile.mock("test.ltx", {
          agroprom: {
            simulation_group_id: 1_000,
          },
        })
      );
    }).toThrow("[JEST_TEST] Failed to assign level 'agroprom' group id '1000', it is not in range [1:255].");
  });

  it("should throw exception on duplicate IDs", () => {
    expect(() => {
      initializeLevelSimulationGroupIds(
        MockIniFile.mock("test.ltx", {
          agroprom: {
            simulation_group_id: 10,
          },
          agroprom_underground: {
            simulation_group_id: 10,
          },
        })
      );
    }).toThrow(
      "[JEST_TEST] Found duplicate group id '10' usage for level 'agroprom_underground', 'agroprom' already using it"
    );
  });
});
