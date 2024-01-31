import { jest } from "@jest/globals";

import { AnyObject, NetPacket, ServerObject, TClassId, TNumberId, TSection, Vector } from "@/engine/lib/types";
import { MockIniFile } from "@/fixtures/xray/mocks/ini";
import { MockLuabindClass } from "@/fixtures/xray/mocks/luabind.mock";
import { mockConfig } from "@/fixtures/xray/mocks/MockConfig";
import { MockAlifeSimulator } from "@/fixtures/xray/mocks/objects/AlifeSimulator.mock";
import { MockVector } from "@/fixtures/xray/mocks/vector.mock";

export interface IMockAlifeObjectConfig {
  id?: TNumberId;
  section?: TSection;
}

/**
 * Mock base alife object implementation.
 */
export class MockAlifeObject extends MockLuabindClass {
  /**
   * @deprecated
   */
  public static mock(section?: TSection): ServerObject {
    return new this({ section }) as unknown as ServerObject;
  }

  public static mockNew(config: IMockAlifeObjectConfig = {}): ServerObject {
    return new this(config) as unknown as ServerObject;
  }

  public static mockWithClassId(classId: TNumberId): ServerObject {
    const object: MockAlifeObject = new this({});

    jest.spyOn(object, "clsid").mockImplementation(() => classId as TClassId);

    return object as unknown as ServerObject;
  }

  public static toMock(object: ServerObject): MockAlifeObject {
    return object as unknown as MockAlifeObject;
  }

  public id: TNumberId;
  public classId: TClassId = -1;
  public section: TSection;
  public position: Vector = MockVector.mock(0, 0, 0);
  public m_level_vertex_id: TNumberId = 255;
  public m_game_vertex_id: TNumberId = 512;

  public online: boolean = true;
  public canSwitchOnline: boolean = true;
  public canSwitchOffline: boolean = true;

  public constructor(config: IMockAlifeObjectConfig | TSection = {}) {
    super();

    if (typeof config === "object") {
      this.id = config.id ?? mockConfig.ID_COUNTER++;
      this.section = config.section ?? "test_alife_object";
    } else {
      this.id = mockConfig.ID_COUNTER++;
      this.section = config ?? "test_alife_object";
    }

    MockAlifeSimulator.addToRegistry(this as unknown as ServerObject);
  }

  public name(): string {
    return `${this.section}_${this.id}`;
  }

  public section_name(): string {
    return this.section;
  }

  public clsid(): TClassId {
    return this.classId;
  }

  public on_spawn(): void {}

  public on_before_register(): void {}

  public on_register(): void {}

  public on_unregister(): void {}

  public keep_saved_data_anyway(): boolean {
    return false;
  }

  public can_switch_online(): boolean {
    return this.canSwitchOnline;
  }

  public can_switch_offline(): boolean {
    return this.canSwitchOffline;
  }

  public spawn_ini(): MockIniFile {
    return new MockIniFile<AnyObject>("object_spawn.ini");
  }

  public STATE_Write(packet: NetPacket): void {
    packet.w_stringZ(`state_write_from_${this.constructor.name}`);
  }

  public STATE_Read(packet: NetPacket, size: number): void {
    packet.r_stringZ();
  }
}

/**
 * Mock data based alife object implementation.
 *
 * @deprecated
 */
export function mockServerAlifeObject({
  sectionOverride = "section",
  id = mockConfig.ID_COUNTER++,
  m_level_vertex_id = 255,
  m_game_vertex_id = 512,
  name,
  clsid = jest.fn(() => -1 as TClassId),
  section_name,
  spawn_ini = jest.fn(() => MockIniFile.mock("spawn.ini")),
  ...rest
}: Partial<ServerObject & { sectionOverride?: string }> = {}): ServerObject {
  const object: ServerObject = {
    ...rest,
    id,
    clsid,
    m_level_vertex_id,
    m_game_vertex_id,
    name: name ?? jest.fn(() => `${sectionOverride}_${id}`),
    section_name: section_name ?? jest.fn(() => sectionOverride),
    position: rest.position ?? MockVector.mock(0.25, 0.25, 0.25),
    spawn_ini,
    update: rest.update ?? jest.fn(),
  } as unknown as ServerObject;

  MockAlifeSimulator.addToRegistry(object);

  return object;
}
