import { describe, expect, it } from "@jest/globals";

import { sortJobsByPriority } from "@/engine/core/utils/job/job_setup";
import { TJobDescriptor } from "@/engine/core/utils/job/job_types";
import { LuaArray } from "@/engine/lib/types";

describe("job_setup utils", () => {
  it("should correctly sort jobs with 'sortJobs'", () => {
    const unsorted: LuaArray<TJobDescriptor> = $fromArray([
      { priority: 10 },
      { priority: 25 },
      { priority: 15, jobs: $fromArray([{ priority: 10 }, { priority: 50 }, { priority: 25 }]) },
    ]);

    sortJobsByPriority(unsorted);

    expect(unsorted).toEqualLuaArrays([
      { priority: 10 },
      { priority: 15, jobs: $fromArray([{ priority: 10 }, { priority: 25 }, { priority: 50 }]) },
      { priority: 25 },
    ]);
  });
});
