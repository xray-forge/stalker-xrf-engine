import { describe, expect, it, jest } from "@jest/globals";
import { getFS } from "xray16";

import { parseConditionsList } from "@/engine/core/utils/ini";
import { loadExclusiveJob } from "@/engine/core/utils/job/job_exclusive";
import { TJobDescriptor } from "@/engine/core/utils/job/job_types";
import { IniFile, LuaArray } from "@/engine/lib/types";
import { mockIniFile, registerIniFileMock } from "@/fixtures/xray";

describe("'job_exclusive' utils", () => {
  it("'loadExclusiveJob' should correctly handle empty ini", () => {
    const list: LuaArray<TJobDescriptor> = new LuaTable();

    loadExclusiveJob(mockIniFile("text.ltx", {}), "a", "b", list);
    expect(list).toEqualLuaArrays([]);
  });

  it("'loadExclusiveJob' should correctly throw if script does not exist", () => {
    const list: LuaArray<TJobDescriptor> = new LuaTable();
    const ini: IniFile = mockIniFile("text.ltx", {
      smart_terrain: {
        work1: "some_file.ltx",
      },
    });

    jest.spyOn(getFS(), "exist").mockImplementation(() => 0);
    expect(() => loadExclusiveJob(ini, "smart_terrain", "work1", list)).toThrow();
  });

  it("'loadExclusiveJob' should correctly read if script does exist", () => {
    const list: LuaArray<TJobDescriptor> = new LuaTable();
    const ini: IniFile = mockIniFile("text.ltx", {
      smart_terrain: {
        work1: "some_file2.ltx",
      },
    });
    const jobIni: IniFile = mockIniFile("scripts\\some_file2.ltx", {});

    registerIniFileMock(jobIni);

    jest.spyOn(getFS(), "exist").mockImplementation(() => 1);

    expect(() => loadExclusiveJob(ini, "smart_terrain", "work1", list)).not.toThrow();
    expect(list).toEqualLuaArrays([
      {
        preconditionIsMonster: false,
        jobId: {
          iniFile: expect.any(Object),
          iniPath: "scripts\\some_file2.ltx",
          jobType: null,
          online: null,
          section: "logic@work1",
        },
        priority: 45,
      },
    ]);
  });

  it("'loadExclusiveJob' should correctly read configured jobs without condlist", () => {
    const list: LuaArray<TJobDescriptor> = new LuaTable();
    const ini: IniFile = mockIniFile("text.ltx", {
      smart_terrain: {
        work2: "some_file3.ltx",
      },
    });
    const jobIni: IniFile = mockIniFile("scripts\\some_file3.ltx", {
      "logic@work2": {
        prior: 101,
        monster_job: true,
        job_online: true,
        active: "animpoint@test1",
      },
    });

    registerIniFileMock(jobIni);

    jest.spyOn(getFS(), "exist").mockImplementation(() => 1);
    loadExclusiveJob(ini, "smart_terrain", "work2", list);

    expect(list).toEqualLuaArrays([
      {
        preconditionIsMonster: true,
        jobId: {
          iniFile: expect.any(Object),
          iniPath: "scripts\\some_file3.ltx",
          jobType: "smartcover_job",
          online: true,
          section: "logic@work2",
        },
        priority: 101,
      },
    ]);
  });

  it("'loadExclusiveJob' should correctly read configured jobs with condlist", () => {
    const list: LuaArray<TJobDescriptor> = new LuaTable();
    const ini: IniFile = mockIniFile("text.ltx", {
      smart_terrain: {
        work2: "some_file3.ltx",
      },
    });
    const jobIni: IniFile = mockIniFile("scripts\\some_file3.ltx", {
      "logic@work2": {
        prior: 105,
        monster_job: false,
        suitable: "{+test_info} true, false",
        job_online: false,
        active: "patrol@test1",
      },
    });

    registerIniFileMock(jobIni);

    jest.spyOn(getFS(), "exist").mockImplementation(() => 1);
    loadExclusiveJob(ini, "smart_terrain", "work2", list);

    expect(list).toEqualLuaArrays([
      {
        preconditionFunction: expect.any(Function),
        preconditionIsMonster: false,
        preconditionParameters: {
          condlist: parseConditionsList("{+test_info} true, false"),
        },
        jobId: {
          iniFile: expect.any(Object),
          iniPath: "scripts\\some_file3.ltx",
          jobType: "path_job",
          online: false,
          section: "logic@work2",
        },
        priority: 105,
      },
      {
        preconditionIsMonster: false,
        jobId: {
          iniFile: expect.any(Object),
          jobType: "path_job",
          section: "logic@work2",
        },
        priority: -1,
      },
    ]);
  });
});
