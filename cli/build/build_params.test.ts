import { describe, expect, it } from "@jest/globals";

import {
  areNoBuildPartsParameters,
  BUILD_ARGS,
  BUILD_PARTS,
  IBuildParameters,
  parseBuildParameters,
} from "#/build/build_params";

describe("'build_params' utils", () => {
  it("Should correctly parse verbosity parameters", () => {
    expect(parseBuildParameters(["--verbose"])[BUILD_ARGS.VERBOSE]).toBe(true);
    expect(parseBuildParameters(["--clean", "--verbose"])[BUILD_ARGS.VERBOSE]).toBe(true);
    expect(parseBuildParameters(["--clean"])[BUILD_ARGS.VERBOSE]).toBe(false);
    expect(parseBuildParameters(["--all"])[BUILD_ARGS.VERBOSE]).toBe(false);
  });

  it("Should correctly parse clean parameters", () => {
    expect(parseBuildParameters(["--clean"])[BUILD_ARGS.CLEAN]).toBe(true);
    expect(parseBuildParameters(["--clean", "--verbose"])[BUILD_ARGS.CLEAN]).toBe(true);
    expect(parseBuildParameters(["--verbose"])[BUILD_ARGS.CLEAN]).toBe(false);
    expect(parseBuildParameters(["--all"])[BUILD_ARGS.CLEAN]).toBe(false);
  });

  it("Should correctly parse no lua logs parameters", () => {
    expect(parseBuildParameters(["--no-lua-logs"])[BUILD_ARGS.NO_LUA_LOGS]).toBe(true);
    expect(parseBuildParameters(["--clean", "--no-lua-logs"])[BUILD_ARGS.NO_LUA_LOGS]).toBe(true);
    expect(parseBuildParameters(["--verbose"])[BUILD_ARGS.NO_LUA_LOGS]).toBe(false);
    expect(parseBuildParameters(["--all"])[BUILD_ARGS.NO_LUA_LOGS]).toBe(false);
  });

  it("Should correctly parse all parameters", () => {
    const allPartsParameters: IBuildParameters = parseBuildParameters(["--all"]);
    const noPartsParameters: IBuildParameters = parseBuildParameters([]);

    Object.values(BUILD_PARTS).forEach((it) => expect(allPartsParameters[it]).toBe(true));
    Object.values(BUILD_PARTS).forEach((it) => expect(noPartsParameters[it]).toBeFalsy());
  });

  it("Should correctly parse all parameters with exclusion", () => {
    const noScriptsParameters: IBuildParameters = parseBuildParameters(["--all", "--no-scripts"]);

    expect(noScriptsParameters[BUILD_PARTS.SCRIPTS]).toBeFalsy();
    expect(noScriptsParameters[BUILD_PARTS.UI]).toBe(true);
    expect(noScriptsParameters[BUILD_PARTS.TRANSLATIONS]).toBe(true);
    expect(noScriptsParameters[BUILD_PARTS.RESOURCES]).toBe(true);

    const noResourcesNoUiParameters: IBuildParameters = parseBuildParameters(["--all", "--no-resources", "--no-ui"]);

    expect(noResourcesNoUiParameters[BUILD_PARTS.SCRIPTS]).toBe(true);
    expect(noResourcesNoUiParameters[BUILD_PARTS.UI]).toBeFalsy();
    expect(noResourcesNoUiParameters[BUILD_PARTS.TRANSLATIONS]).toBe(true);
    expect(noResourcesNoUiParameters[BUILD_PARTS.RESOURCES]).toBeFalsy();
  });

  it("Should correctly parse all parameters with inclusion", () => {
    const noScriptsParameters: IBuildParameters = parseBuildParameters(["--scripts"]);

    expect(noScriptsParameters[BUILD_PARTS.SCRIPTS]).toBe(true);
    expect(noScriptsParameters[BUILD_PARTS.UI]).toBeFalsy();
    expect(noScriptsParameters[BUILD_PARTS.TRANSLATIONS]).toBeFalsy();
    expect(noScriptsParameters[BUILD_PARTS.RESOURCES]).toBeFalsy();

    const noResourcesNoUiParameters: IBuildParameters = parseBuildParameters(["--resources", "--ui"]);

    expect(noResourcesNoUiParameters[BUILD_PARTS.SCRIPTS]).toBeFalsy();
    expect(noResourcesNoUiParameters[BUILD_PARTS.UI]).toBe(true);
    expect(noResourcesNoUiParameters[BUILD_PARTS.TRANSLATIONS]).toBeFalsy();
    expect(noResourcesNoUiParameters[BUILD_PARTS.RESOURCES]).toBe(true);
  });

  it("Should correctly check if empty content parameters are provided", () => {
    expect(areNoBuildPartsParameters(parseBuildParameters(["--scripts"]))).toBe(false);
    expect(areNoBuildPartsParameters(parseBuildParameters(["--resources", "--ui"]))).toBe(false);
    expect(areNoBuildPartsParameters(parseBuildParameters(["--all"]))).toBe(false);
    expect(areNoBuildPartsParameters(parseBuildParameters([]))).toBe(true);
    expect(areNoBuildPartsParameters(parseBuildParameters(["--verbose"]))).toBe(true);
    expect(areNoBuildPartsParameters(parseBuildParameters(["--clean"]))).toBe(true);
  });
});
