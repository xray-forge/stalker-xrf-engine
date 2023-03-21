import { getFS } from "xray16";

/**
 * Enable modules requiring.
 * Set root folder for lua scripts as $game_data filesystem path.
 */
// @ts-ignore lua globals package, conflicting with javascript strict mode internals.
package.path = package.path + getFS().update_path("$game_data$", "\\?.script;");

/**
 * Initialize extern references.
 */
require("@/engine/scripts/declarations/callbacks");
