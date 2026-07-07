import { MockPatrol } from "xray16/mocks";

import { patrols } from "@/fixtures/xray/mocks/objects/path/patrols";

/**
 * Inject the engine's patrol test fixtures into the package `MockPatrol` (by reference).
 */
export function mockPatrols(): void {
  MockPatrol.setup(patrols);
}
