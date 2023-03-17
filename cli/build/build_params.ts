import { PartialRecord } from "@/engine/lib/types";

/**
 * todo;
 */
export const BUILD_PARTS = {
  RESOURCES: "resources",
  UI: "ui",
  SCRIPTS: "scripts",
  CONFIGS: "configs",
  TRANSLATIONS: "translations",
};

/**
 * todo;
 */
export const BUILD_ARGS = {
  ...BUILD_PARTS,
  ALL: "--all",
  CLEAN: "--clean",
  NO_LUA_LOGS: "--no-lua-logs",
  VERBOSE: "--verbose",
};

/**
 * todo;
 */
export interface IBuildParameters
  extends PartialRecord<(typeof BUILD_ARGS)[keyof typeof BUILD_ARGS], boolean | undefined> {}

/**
 * todo;
 */
export function parseBuildParameters(args: Array<string>): IBuildParameters {
  const buildParameters: IBuildParameters = {};

  buildParameters[BUILD_ARGS.VERBOSE] = args.includes(BUILD_ARGS.VERBOSE);
  buildParameters[BUILD_ARGS.CLEAN] = args.includes(BUILD_ARGS.CLEAN);
  buildParameters[BUILD_ARGS.NO_LUA_LOGS] = args.includes(BUILD_ARGS.NO_LUA_LOGS);

  if (args.includes(BUILD_ARGS.ALL)) {
    Object.values(BUILD_PARTS).forEach((it) => (buildParameters[it] = true));
  }

  Object.values(BUILD_PARTS).forEach((it) => {
    if (args.includes(`--${it}`)) {
      buildParameters[it] = true;
    }
  });

  Object.values(BUILD_PARTS).forEach((it) => {
    if (args.includes(`--no-${it}`)) {
      buildParameters[it] = false;
    }
  });

  return buildParameters;
}

/**
 * todo;
 */
export function areNoBuildPartsParameters(parameters: IBuildParameters): boolean {
  return Object.values(BUILD_PARTS).every((it) => !parameters[it]);
}
