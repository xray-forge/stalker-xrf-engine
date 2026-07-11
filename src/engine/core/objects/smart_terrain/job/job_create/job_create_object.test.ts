import { describe, expect, it } from "@jest/globals";
import { ServerHumanObject, ServerMonsterBaseObject } from "xray16/alias";
import { NIL } from "xray16/lib";
import { MockAlifeHumanStalker, MockAlifeMonsterBase } from "xray16/mocks";

import { createObjectJobDescriptor } from "@/engine/core/objects/smart_terrain/job";
import { ESchemeType } from "@/engine/lib/types";

describe("createObjectJobDescriptor util", () => {
  it("should correctly create descriptor objects for stalkers", () => {
    const object: ServerHumanObject = MockAlifeHumanStalker.mock();

    expect(createObjectJobDescriptor(object)).toEqual({
      object,
      jobPriority: -1,
      desiredJob: NIL,
      scanCursor: 1,
      isBegun: false,
      isMonster: false,
      job: null,
      jobId: -1,
      schemeType: ESchemeType.STALKER,
    });
  });

  it("should correctly create descriptor objects for monsters", () => {
    const object: ServerMonsterBaseObject = MockAlifeMonsterBase.mock();

    expect(createObjectJobDescriptor(object)).toEqual({
      object,
      jobPriority: -1,
      desiredJob: NIL,
      scanCursor: 1,
      isBegun: false,
      isMonster: true,
      job: null,
      jobId: -1,
      schemeType: ESchemeType.MONSTER,
    });
  });
});
