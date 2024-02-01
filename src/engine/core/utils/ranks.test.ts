import { beforeEach, describe, expect, it } from "@jest/globals";
import { clsid } from "xray16";

import { IRankDescriptor, SYSTEM_INI } from "@/engine/core/database";
import {
  getGameObjectRank,
  getMonsterRankByName,
  getMonsterRankByValue,
  getNextMonsterRank,
  getNextStalkerRank,
  getServerObjectRank,
  getStalkerRankByName,
  getStalkerRankByValue,
  readRanksList,
} from "@/engine/core/utils/ranks";
import { LuaArray } from "@/engine/lib/types";
import { resetRegistry } from "@/fixtures/engine";
import { MockAlifeMonsterBase, MockGameObject } from "@/fixtures/xray";

describe("readRanksList util", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should correctly read ranks from ini file", () => {
    const stalkerRanks: LuaArray<IRankDescriptor> = readRanksList(SYSTEM_INI, "game_relations", "rating");
    const monsterRanks: LuaArray<IRankDescriptor> = readRanksList(SYSTEM_INI, "game_relations", "monster_rating");

    expect(stalkerRanks).toEqualLuaArrays([
      {
        max: 300,
        min: 0,
        name: "novice",
      },
      {
        max: 600,
        min: 300,
        name: "experienced",
      },
      {
        max: 900,
        min: 600,
        name: "veteran",
      },
      {
        max: 65535,
        min: 900,
        name: "master",
      },
    ]);
    expect(monsterRanks).toEqualLuaArrays([
      {
        max: 400,
        min: 0,
        name: "weak",
      },
      {
        max: 800,
        min: 400,
        name: "normal",
      },
      {
        max: 65535,
        min: 800,
        name: "strong",
      },
    ]);
  });
});

describe("getStalkerRankByName util", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should correctly get stalker ranks", () => {
    expect(() => getStalkerRankByName("test")).toThrow("Unknown stalker rank supplied for check: 'test'.");
    expect(getStalkerRankByName("novice")).toEqual({
      max: 300,
      min: 0,
      name: "novice",
    });
    expect(getStalkerRankByName("master")).toEqual({
      max: 65535,
      min: 900,
      name: "master",
    });
  });
});

describe("getMonsterRankByName util", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should correctly get stalker ranks", () => {
    expect(() => getMonsterRankByName("test")).toThrow("Unknown monster rank supplied for check: 'test'.");
    expect(getMonsterRankByName("weak")).toEqual({
      max: 400,
      min: 0,
      name: "weak",
    });
    expect(getMonsterRankByName("strong")).toEqual({
      max: 65535,
      min: 800,
      name: "strong",
    });
  });
});

describe("getNextStalkerRank util", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should correctly get next stalker ranks", () => {
    expect(getNextStalkerRank("novice")).toEqual({
      max: 600,
      min: 300,
      name: "experienced",
    });
    expect(getNextStalkerRank("veteran")).toEqual({
      max: 65535,
      min: 900,
      name: "master",
    });
    expect(getNextStalkerRank("not_existing")).toEqual({
      max: 65535,
      min: 900,
      name: "master",
    });
  });
});

describe("getNextMonsterRank util", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should correctly get next monster ranks", () => {
    expect(getNextMonsterRank("weak")).toEqual({
      max: 800,
      min: 400,
      name: "normal",
    });
    expect(getNextMonsterRank("normal")).toEqual({
      max: 65535,
      min: 800,
      name: "strong",
    });
    expect(getNextMonsterRank("not_existing")).toEqual({
      max: 65535,
      min: 800,
      name: "strong",
    });
  });
});

describe("getStalkerRankByValue util", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should correctly get stalker ranks", () => {
    expect(getStalkerRankByValue(0)).toEqual({
      max: 300,
      min: 0,
      name: "novice",
    });
    expect(getStalkerRankByValue(300)).toEqual({
      max: 600,
      min: 300,
      name: "experienced",
    });
    expect(getStalkerRankByValue(65535)).toEqual({
      max: 65535,
      min: 900,
      name: "master",
    });
    expect(getStalkerRankByValue(Infinity)).toEqual({
      max: 65535,
      min: 900,
      name: "master",
    });
  });
});

describe("getMonsterRankByValue util", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should correctly get stalker ranks", () => {
    expect(getMonsterRankByValue(0)).toEqual({
      max: 400,
      min: 0,
      name: "weak",
    });
    expect(getMonsterRankByValue(400)).toEqual({
      max: 800,
      min: 400,
      name: "normal",
    });
    expect(getMonsterRankByValue(65535)).toEqual({
      max: 65535,
      min: 800,
      name: "strong",
    });
    expect(getMonsterRankByValue(Infinity)).toEqual({
      max: 65535,
      min: 800,
      name: "strong",
    });
  });
});

describe("getGameObjectRank util", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should correctly get ranks", () => {
    expect(getGameObjectRank(MockGameObject.mock({ clsid: clsid.script_stalker, characterRank: 155 }))).toEqual({
      max: 300,
      min: 0,
      name: "novice",
    });
    expect(getGameObjectRank(MockGameObject.mock({ clsid: clsid.trader, rank: 600 }))).toEqual({
      max: 900,
      min: 600,
      name: "veteran",
    });
    expect(getGameObjectRank(MockGameObject.mock({ clsid: clsid.bloodsucker_s, characterRank: 600 }))).toEqual({
      max: 800,
      min: 400,
      name: "normal",
    });
    expect(getGameObjectRank(MockGameObject.mock({ clsid: clsid.pseudo_gigant, rank: 1200 }))).toEqual({
      max: 65535,
      min: 800,
      name: "strong",
    });
  });
});

describe("getServerObjectRank util", () => {
  beforeEach(() => {
    resetRegistry();
  });

  it("should correctly get stalker ranks", () => {
    expect(getServerObjectRank(MockAlifeMonsterBase.mock({ clsid: clsid.script_stalker, rank: 155 }))).toEqual({
      max: 300,
      min: 0,
      name: "novice",
    });
    expect(getServerObjectRank(MockAlifeMonsterBase.mock({ clsid: clsid.trader, rank: 600 }))).toEqual({
      max: 900,
      min: 600,
      name: "veteran",
    });
    expect(getServerObjectRank(MockAlifeMonsterBase.mock({ clsid: clsid.bloodsucker_s, rank: 600 }))).toEqual({
      max: 800,
      min: 400,
      name: "normal",
    });
    expect(getServerObjectRank(MockAlifeMonsterBase.mock({ clsid: clsid.pseudo_gigant, rank: 1200 }))).toEqual({
      max: 65_535,
      min: 800,
      name: "strong",
    });
  });
});
