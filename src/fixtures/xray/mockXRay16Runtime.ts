/**
 * Runtime resolution target for the bare `xray16` module under jest (wired via `moduleNameMapper`).
 * Temporary compat during migration into xray16 package.
 */
export { MockVector as vector, MockVector2D as vector2 } from "xray16/mocks";
