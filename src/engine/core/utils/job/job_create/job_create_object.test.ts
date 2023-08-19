import { describe, expect, it } from "@jest/globals";

import { createObjectJobDescriptor } from "@/engine/core/utils/job";
import { NIL } from "@/engine/lib/constants/words";
import { ESchemeType, ServerHumanObject, ServerMonsterBaseObject } from "@/engine/lib/types";
import { mockServerAlifeHumanStalker, mockServerAlifeMonsterBase } from "@/fixtures/xray";

describe("'job_crete_object' utils", () => {
  it("'createObjectJobDescriptor' should correctly create descriptor objects for stalkers", () => {
    const object: ServerHumanObject = mockServerAlifeHumanStalker();

    expect(createObjectJobDescriptor(object)).toEqual({
      object,
      jobPriority: -1,
      desiredJob: NIL,
      isBegun: false,
      isMonster: false,
      job: null,
      jobId: -1,
      schemeType: ESchemeType.STALKER,
    });
  });

  it("'createObjectJobDescriptor' should correctly create descriptor objects for monsters", () => {
    const object: ServerMonsterBaseObject = mockServerAlifeMonsterBase();

    expect(createObjectJobDescriptor(object)).toEqual({
      object,
      jobPriority: -1,
      desiredJob: NIL,
      isBegun: false,
      isMonster: true,
      job: null,
      jobId: -1,
      schemeType: ESchemeType.MONSTER,
    });
  });
});
