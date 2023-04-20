import { jest } from "@jest/globals";
import { TXR_class_id, XR_cse_alife_object } from "xray16";

import { AnyObject, TSection } from "@/engine/lib/types";
import { MockIniFile, mockIniFile } from "@/fixtures/xray/mocks/ini";
import { AbstractLuabindClass } from "@/fixtures/xray/mocks/objects/AbstractLuabindClass";
import { MockAlifeSimulator } from "@/fixtures/xray/mocks/objects/AlifeSimulator.mock";

let ID_COUNTER: number = 1000;

/**
 * todo;
 */
export class MockAlifeObject extends AbstractLuabindClass {
  public id: number = ID_COUNTER++;
  public section: TSection;

  public constructor(section: TSection) {
    super();

    this.section = section;
  }

  public name(): string {
    return `${this.section}_${this.id}`;
  }

  public section_name(): string {
    return this.section;
  }

  public on_register(): void {
    MockAlifeSimulator.addToRegistry(this as unknown as XR_cse_alife_object);
  }

  public on_unregister(): void {
    MockAlifeSimulator.removeFromRegistry(this.id);
  }

  public keep_saved_data_anyway(): boolean {
    return false;
  }

  public can_switch_online(): boolean {
    return true;
  }

  public spawn_ini(): MockIniFile<AnyObject> {
    return new MockIniFile<AnyObject>("object_spawn.ini");
  }

  public STATE_Write(): void {}

  public STATE_Read(): void {}
}

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
