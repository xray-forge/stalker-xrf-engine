import { describe, expect, it } from "@jest/globals";

import { EBuildTarget, getBuildTargets, IBuildCommandParameters } from "#/build/build";

function getParameters(
  include: IBuildCommandParameters["include"],
  exclude: Array<EBuildTarget> = []
): IBuildCommandParameters {
  return { assetOverrides: false, exclude, include };
}

describe("build targets", () => {
  it("should include extern manifests in an all-target build", () => {
    expect(getBuildTargets(getParameters("all"))).toContain(EBuildTarget.EXTERNS);
  });

  it("should support focused and excluded extern manifest builds", () => {
    expect(getBuildTargets(getParameters([EBuildTarget.EXTERNS]))).toEqual([EBuildTarget.EXTERNS]);
    expect(getBuildTargets(getParameters("all", [EBuildTarget.EXTERNS]))).not.toContain(EBuildTarget.EXTERNS);
  });
});
