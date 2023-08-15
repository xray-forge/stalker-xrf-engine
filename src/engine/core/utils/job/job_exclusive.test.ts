import { describe, expect, it, jest } from "@jest/globals";
import { getFS } from "xray16";

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
        _precondition_is_monster: false,
        job_id: {
          ini_file: expect.any(Object),
          ini_path: "scripts\\some_file2.ltx",
          job_type: null,
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
        _precondition_is_monster: true,
        job_id: {
          ini_file: expect.any(Object),
          ini_path: "scripts\\some_file3.ltx",
          job_type: "smartcover_job",
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
        _precondition_function: expect.any(Function),
        _precondition_is_monster: false,
        _precondition_params: {
          condlist: {
            "1": {
              infop_check: {
                "1": {
                  name: "test_info",
                  required: true,
                },
              },
              infop_set: {},
              section: "true",
            },
            "2": {
              infop_check: {},
              infop_set: {},
              section: "false",
            },
          },
        },
        job_id: {
          ini_file: expect.any(Object),
          ini_path: "scripts\\some_file3.ltx",
          job_type: "path_job",
          online: false,
          section: "logic@work2",
        },
        priority: 105,
      },
      {
        _precondition_is_monster: false,
        job_id: {
          ini_file: expect.any(Object),
          job_type: "path_job",
          section: "logic@work2",
        },
        priority: -1,
      },
    ]);
  });
});
