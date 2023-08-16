import { jest } from "@jest/globals";
import { rotation } from "xray16";

import { ServerHumanObject } from "@/engine/lib/types";
import { mockClsid } from "@/fixtures/xray/mocks/constants";
import {
  MockServerAlifeCreatureAbstract,
  mockServerAlifeCreatureAbstract,
} from "@/fixtures/xray/mocks/objects/server/cse_alife_creature_abstract.mock";

/**
 * todo;
 */
export class MockAlifeHumanStalker extends MockServerAlifeCreatureAbstract {
  public clsid = jest.fn(() => mockClsid.script_stalker);
}

/**
 * todo;
 */
export function mockServerAlifeHumanStalker(base: Partial<ServerHumanObject> = {}): ServerHumanObject {
  return mockServerAlifeCreatureAbstract({
    ...base,
    clsid: base.clsid || jest.fn(() => mockClsid.script_stalker),
    community: base.community || jest.fn(() => "stalker"),
    force_set_goodwill: base.force_set_goodwill || jest.fn(),
    o_torso: base.o_torso || jest.fn(() => ({}) as unknown as rotation),
  } as unknown as ServerHumanObject) as unknown as ServerHumanObject;
}
