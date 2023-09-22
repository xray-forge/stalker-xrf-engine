import * as fs from "fs";
import * as path from "path";

import { ROOT_DIR } from "#/globals/paths";
import { Optional } from "#/utils/types";

/**
 * Get current repository/branch commit hash.
 */
export function getCommitHash(): Optional<string> {
  try {
    const revision: string = fs.readFileSync(path.resolve(ROOT_DIR, ".git/HEAD")).toString().trim();

    if (revision.indexOf(":") === -1) {
      return revision;
    } else {
      return fs
        .readFileSync(".git/" + revision.substring(5))
        .toString()
        .trim();
    }
  } catch (error) {
    return null;
  }
}
