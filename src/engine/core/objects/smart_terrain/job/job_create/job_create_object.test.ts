import { describe, expect, it } from "@jest/globals";

import { createObjectJobDescriptor } from "@/engine/core/objects/smart_terrain/job";
import { NIL } from "@/engine/lib/constants/words";
import { ESchemeType, ServerHumanObject, ServerMonsterBaseObject } from "@/engine/lib/types";
import { MockAlifeHumanStalker, MockAlifeMonsterBase } from "@/fixtures/xray";

describe("job_crete_object utils", () => {
  it("createObjectJobDescriptor should correctly create descriptor objects for stalkers", () => {
    const object: ServerHumanObject = MockAlifeHumanStalker.mock();

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

  it("createObjectJobDescriptor should correctly create descriptor objects for monsters", () => {
    const object: ServerMonsterBaseObject = MockAlifeMonsterBase.mock();

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
