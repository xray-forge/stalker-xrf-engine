import { describe, expect, it, jest } from "@jest/globals";
import { FileStatus, getFS } from "xray16";
import { IniFile } from "xray16/alias";
import { MockFileStatus, MockIniFile } from "xray16/mocks";

import { parseConditionsList } from "@/engine/core/ini";
import { createExclusiveJob } from "@/engine/core/objects/smart_terrain/job/job_create/job_create_exclusive";
import { jobPreconditionExclusive } from "@/engine/core/objects/smart_terrain/job/job_precondition";
import { EJobPathType, EJobType, TSmartTerrainJobsList } from "@/engine/core/objects/smart_terrain/job/job_types";

describe("createExclusiveJob util", () => {
  it("should correctly handle empty ini", () => {
    const list: TSmartTerrainJobsList = createExclusiveJob(MockIniFile.mock("text.ltx", {}), "a", "b", new LuaTable());

    expect(list).toEqualLuaArrays([]);
  });

  it("should correctly throw if script does not exist", () => {
    const ini: IniFile = MockIniFile.mock("text.ltx", {
      smart_terrain: {
        work1: "some_file.ltx",
      },
    });

    jest.spyOn(getFS(), "exist").mockImplementation(() => null as unknown as FileStatus);

    expect(() => createExclusiveJob(ini, "smart_terrain", "work1", new LuaTable())).toThrow();
  });

  it("should correctly read if script does exist", () => {
    const list: TSmartTerrainJobsList = new LuaTable();
    const ini: IniFile = MockIniFile.mock("text.ltx", {
      smart_terrain: {
        work1: "some_file2.ltx",
      },
    });
    const jobIni: IniFile = MockIniFile.mock("scripts\\some_file2.ltx", {});

    MockIniFile.registerIni(jobIni);

    jest.spyOn(getFS(), "exist").mockImplementation(() => MockFileStatus.mock());

    expect(() => createExclusiveJob(ini, "smart_terrain", "work1", list)).not.toThrow();
    expect(list).toEqualLuaArrays([
      {
        isMonsterJob: false,
        iniFile: expect.any(Object),
        iniPath: "scripts\\some_file2.ltx",
        pathType: null,
        online: null,
        section: "logic@work1",
        type: EJobType.EXCLUSIVE,
        priority: 45,
      },
    ]);
  });

  it("should correctly read configured jobs without condlist", () => {
    const list: TSmartTerrainJobsList = new LuaTable();
    const ini: IniFile = MockIniFile.mock("text.ltx", {
      smart_terrain: {
        work2: "some_file3.ltx",
      },
    });
    const jobIni: IniFile = MockIniFile.mock("scripts\\some_file3.ltx", {
      "logic@work2": {
        type: EJobType.EXCLUSIVE,
        prior: 101,
        monster_job: true,
        job_online: true,
        active: "animpoint@test1",
      },
    });

    MockIniFile.registerIni(jobIni);

    jest.spyOn(getFS(), "exist").mockImplementation(() => MockFileStatus.mock());
    createExclusiveJob(ini, "smart_terrain", "work2", list);

    expect(list).toEqualLuaArrays([
      {
        isMonsterJob: true,
        iniFile: expect.any(Object),
        iniPath: "scripts\\some_file3.ltx",
        pathType: EJobPathType.SMART_COVER,
        online: true,
        section: "logic@work2",
        type: EJobType.EXCLUSIVE,
        priority: 101,
      },
    ]);
  });

  it("should correctly read configured jobs with condlist", () => {
    const list: TSmartTerrainJobsList = new LuaTable();
    const ini: IniFile = MockIniFile.mock("text.ltx", {
      smart_terrain: {
        work2: "some_file3.ltx",
      },
    });
    const jobIni: IniFile = MockIniFile.mock("scripts\\some_file3.ltx", {
      "logic@work2": {
        prior: 105,
        type: EJobType.EXCLUSIVE,
        monster_job: false,
        suitable: "{+test_info} true, false",
        job_online: false,
        active: "patrol@test1",
      },
    });

    MockIniFile.registerIni(jobIni);

    jest.spyOn(getFS(), "exist").mockImplementation(() => MockFileStatus.mock());
    createExclusiveJob(ini, "smart_terrain", "work2", list);

    expect(list).toEqualLuaArrays([
      {
        preconditionFunction: jobPreconditionExclusive,
        isMonsterJob: false,
        preconditionParameters: {
          condlist: parseConditionsList("{+test_info} true, false"),
        },
        iniFile: expect.any(Object),
        iniPath: "scripts\\some_file3.ltx",
        pathType: EJobPathType.PATH,
        online: false,
        section: "logic@work2",
        type: EJobType.EXCLUSIVE,
        priority: 105,
      },
      {
        isMonsterJob: false,
        iniFile: expect.any(Object),
        pathType: EJobPathType.PATH,
        section: "logic@work2",
        type: EJobType.EXCLUSIVE,
        priority: -1,
      },
    ]);
  });
});
