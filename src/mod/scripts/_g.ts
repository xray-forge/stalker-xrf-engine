import { getFS } from "xray16";

// @ts-ignore lua globals package, conflicting with javascript strict mode internals. Enable requiring from gamedata.
package.path = package.path + string.format("%sgamedata\\?.script;", getFS().update_path("$fs_root$", ""));

/**
 * Initialize extern references from game code.
 * Initialize global utils to work with luabind.
 */
require("@/mod/scripts/globals/luabind");
require("@/mod/scripts/globals/extern");
