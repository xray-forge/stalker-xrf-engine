import * as fsPromises from "fs/promises";
import * as path from "path";

import { describe, expect, it, jest } from "@jest/globals";

import { SmartTerrain } from "@/engine/core/objects";
import { loadSmartTerrainJobs } from "@/engine/core/objects/server/smart_terrain/jobs_general";

describe("jobs_general should correctly generate default jobs", () => {
  it("should correctly generate default jobs", async () => {
    const DEFAULT_JOBS_GENERAL: string = (
      await fsPromises.readFile(path.resolve(__dirname, "__test__", "jobs_general.default.ltx"))
    )
      .toString()
      .replace(/\r\n/g, "\n");

    const smartTerrain: SmartTerrain = new SmartTerrain("test_smart");

    smartTerrain.ini = smartTerrain.spawn_ini();

    jest.spyOn(smartTerrain, "name").mockImplementation(() => "test_smart");

    const [jobsList, ltx] = loadSmartTerrainJobs(smartTerrain);

    expect(ltx).toBe(DEFAULT_JOBS_GENERAL);
  });
});
