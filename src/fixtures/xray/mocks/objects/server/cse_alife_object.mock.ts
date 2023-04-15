import { jest } from "@jest/globals";
import { TXR_class_id, XR_cse_alife_object } from "xray16";

import { mockIniFile } from "@/fixtures/xray/mocks/ini";
import { AbstractLuabindClass } from "@/fixtures/xray/mocks/objects/AbstractLuabindClass";

let ID_COUNTER: number = 1000;

/**
 * todo;
 */
export class MockAlifeObject extends AbstractLuabindClass {}

/**
 * todo;
 */
export function mockServerAlifeObject({
  sectionOverride = "section",
  id = ID_COUNTER++,
  m_game_vertex_id = 1,
  name,
  clsid = jest.fn(() => -1 as TXR_class_id),
  section_name,
  spawn_ini = jest.fn(() => mockIniFile("spawn.ini")),
  ...rest
}: Partial<XR_cse_alife_object & { sectionOverride?: string }> = {}): XR_cse_alife_object {
  return {
    ...rest,
    id,
    clsid,
    m_game_vertex_id,
    name: name || jest.fn(() => `${sectionOverride}_${id}`),
    section_name: section_name || jest.fn(() => sectionOverride),
    spawn_ini,
  } as unknown as XR_cse_alife_object;
}
