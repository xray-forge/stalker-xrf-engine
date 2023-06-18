import { jest } from "@jest/globals";

import { AnyObject, ServerObject, TClassId, TNumberId, TSection, Vector } from "@/engine/lib/types";
import { MockIniFile, mockIniFile } from "@/fixtures/xray/mocks/ini";
import { AbstractLuabindClass } from "@/fixtures/xray/mocks/objects/AbstractLuabindClass";
import { MockAlifeSimulator } from "@/fixtures/xray/mocks/objects/AlifeSimulator.mock";
import { MockVector } from "@/fixtures/xray/mocks/vector.mock";

let ID_COUNTER: number = 100_000;

/**
 * todo;
 */
export class MockAlifeObject extends AbstractLuabindClass {
  public id: TNumberId = ID_COUNTER++;
  public section: TSection;
  public position: Vector = MockVector.mock(0, 0, 0);

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
    MockAlifeSimulator.addToRegistry(this as unknown as ServerObject);
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

  public can_switch_offline(): boolean {
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
  clsid = jest.fn(() => -1 as TClassId),
  section_name,
  spawn_ini = jest.fn(() => mockIniFile("spawn.ini")),
  ...rest
}: Partial<ServerObject & { sectionOverride?: string }> = {}): ServerObject {
  return {
    ...rest,
    id,
    clsid,
    m_game_vertex_id,
    name: name || jest.fn(() => `${sectionOverride}_${id}`),
    section_name: section_name || jest.fn(() => sectionOverride),
    spawn_ini,
  } as unknown as ServerObject;
}
