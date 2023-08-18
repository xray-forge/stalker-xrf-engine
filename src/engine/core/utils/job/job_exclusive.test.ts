import { describe, expect, it, jest } from "@jest/globals";
import { getFS } from "xray16";

import { parseConditionsList } from "@/engine/core/utils/ini";
import { createExclusiveJob } from "@/engine/core/utils/job/job_exclusive";
import { jobPreconditionExclusive } from "@/engine/core/utils/job/job_precondition";
import { EJobPathType, EJobType, ISmartTerrainJobDescriptor } from "@/engine/core/utils/job/job_types";
import { IniFile, LuaArray } from "@/engine/lib/types";
import { mockIniFile, registerIniFileMock } from "@/fixtures/xray";

describe("'job_exclusive' utils", () => {
  it("'loadExclusiveJob' should correctly handle empty ini", () => {
    const list: LuaArray<ISmartTerrainJobDescriptor> = createExclusiveJob(
      mockIniFile("text.ltx", {}),
      "a",
      "b",
      new LuaTable()
    );

    expect(list).toEqualLuaArrays([]);
  });

  it("'loadExclusiveJob' should correctly throw if script does not exist", () => {
    const ini: IniFile = mockIniFile("text.ltx", {
      smart_terrain: {
        work1: "some_file.ltx",
      },
    });

    jest.spyOn(getFS(), "exist").mockImplementation(() => 0);
    expect(() => createExclusiveJob(ini, "smart_terrain", "work1", new LuaTable())).toThrow();
  });

  it("'loadExclusiveJob' should correctly read if script does exist", () => {
    const list: LuaArray<ISmartTerrainJobDescriptor> = new LuaTable();
    const ini: IniFile = mockIniFile("text.ltx", {
      smart_terrain: {
        work1: "some_file2.ltx",
      },
    });
    const jobIni: IniFile = mockIniFile("scripts\\some_file2.ltx", {});

    registerIniFileMock(jobIni);

    jest.spyOn(getFS(), "exist").mockImplementation(() => 1);

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

  it("'loadExclusiveJob' should correctly read configured jobs without condlist", () => {
    const list: LuaArray<ISmartTerrainJobDescriptor> = new LuaTable();
    const ini: IniFile = mockIniFile("text.ltx", {
      smart_terrain: {
        work2: "some_file3.ltx",
      },
    });
    const jobIni: IniFile = mockIniFile("scripts\\some_file3.ltx", {
      "logic@work2": {
        type: EJobType.EXCLUSIVE,
        prior: 101,
        monster_job: true,
        job_online: true,
        active: "animpoint@test1",
      },
    });

    registerIniFileMock(jobIni);

    jest.spyOn(getFS(), "exist").mockImplementation(() => 1);
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

  it("'loadExclusiveJob' should correctly read configured jobs with condlist", () => {
    const list: LuaArray<ISmartTerrainJobDescriptor> = new LuaTable();
    const ini: IniFile = mockIniFile("text.ltx", {
      smart_terrain: {
        work2: "some_file3.ltx",
      },
    });
    const jobIni: IniFile = mockIniFile("scripts\\some_file3.ltx", {
      "logic@work2": {
        prior: 105,
        type: EJobType.EXCLUSIVE,
        monster_job: false,
        suitable: "{+test_info} true, false",
        job_online: false,
        active: "patrol@test1",
      },
    });

    registerIniFileMock(jobIni);

    jest.spyOn(getFS(), "exist").mockImplementation(() => 1);
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
    ]);
  });
});
