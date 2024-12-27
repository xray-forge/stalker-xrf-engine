import { jest } from "@jest/globals";

import {
  IniFile,
  NetPacket,
  Optional,
  ServerObject,
  TClassId,
  TName,
  TNumberId,
  TRate,
  TSection,
  Vector,
} from "@/engine/lib/types";
import { MockIniFile } from "@/fixtures/xray/mocks/ini/IniFile.mock";
import { MockLuabindClass } from "@/fixtures/xray/mocks/luabind.mock";
import { mockConfig } from "@/fixtures/xray/mocks/MockConfig";
import { MockAlifeSimulator } from "@/fixtures/xray/mocks/objects/AlifeSimulator.mock";
import { MockVector } from "@/fixtures/xray/mocks/vector.mock";

export interface IMockAlifeObjectConfig {
  alive?: boolean;
  clsid?: TNumberId;
  community?: TName;
  gameVertexId?: TNumberId;
  groupId?: TNumberId;
  id?: TNumberId;
  levelVertexId?: TNumberId;
  name?: TName;
  online?: boolean;
  parentId?: TNumberId;
  position?: Vector;
  rank?: TRate;
  section?: TSection;
  smartTerrainId?: TNumberId;
  spawnIni?: IniFile;
  storyId?: TNumberId;
}

/**
 * Mock base alife object implementation.
 */
export class MockAlifeObject extends MockLuabindClass {
  public static mock(config: IMockAlifeObjectConfig = {}): ServerObject {
    return new this(config) as unknown as ServerObject;
  }

  public static mockWithClassId(classId: TNumberId): ServerObject {
    const object: MockAlifeObject = new this({ clsid: classId });

    return object as unknown as ServerObject;
  }

  public static toMock(object: ServerObject): MockAlifeObject {
    return object as unknown as MockAlifeObject;
  }

  public id: TNumberId;
  public classId: TClassId;
  public section: TSection;
  public position: Vector;
  public m_story_id: TNumberId;
  public parent_id: TNumberId;
  public m_level_vertex_id: TNumberId;
  public m_game_vertex_id: TNumberId;

  public online: boolean;
  public canSwitchOnline: boolean = true;
  public canSwitchOffline: boolean = true;

  public objectAlive: boolean;
  public objectName: TName;
  public objectCommunity: TName;
  public spawnIni: Optional<IniFile>;

  public constructor(config: IMockAlifeObjectConfig | TSection = {}) {
    super();

    if (typeof config === "object") {
      this.classId = (config.clsid as TClassId) ?? -1;
      this.id = config.id ?? mockConfig.ID_COUNTER++;
      this.m_game_vertex_id = config.gameVertexId ?? 512;
      this.m_level_vertex_id = config.levelVertexId ?? 255;
      this.m_story_id = config.storyId ?? -1;
      this.parent_id = config.parentId ?? -1;
      this.position = config.position ?? MockVector.mock(0, 0, 0);
      this.section = config.section ?? "test_alife_object";
      this.spawnIni = typeof config.spawnIni === "undefined" ? MockIniFile.mock("object_spawn.ini") : config.spawnIni;
      this.online = config.online ?? true;

      this.objectAlive = config.alive ?? true;
      this.objectCommunity = config.community ?? "unknown";
      this.objectName = config.name ?? `${this.section}_${this.id}`;
    } else {
      this.classId = -1;
      this.id = mockConfig.ID_COUNTER++;
      this.m_game_vertex_id = 512;
      this.m_level_vertex_id = 255;
      this.m_story_id = -1;
      this.parent_id = -1;
      this.position = MockVector.mock(0, 0, 0);
      this.section = config ?? "test_alife_object";
      this.spawnIni = MockIniFile.mock("object_spawn.ini");
      this.online = true;

      this.objectAlive = true;
      this.objectCommunity = "unknown";
      this.objectName = `${this.section}_${this.id}`;
    }

    MockAlifeSimulator.addToRegistry(this as unknown as ServerObject);
  }

  public name(): string {
    return this.objectName;
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

  public spawn_ini = jest.fn(() => this.spawnIni);

  public community = jest.fn(() => this.objectCommunity);

  public alive = jest.fn(() => this.objectAlive);

  public visible_for_map = jest.fn();

  public update = jest.fn();

  public clear_smart_terrain = jest.fn();

  public STATE_Write(packet: NetPacket): void {
    packet.w_stringZ(`state_write_from_${this.constructor.name}`);
  }

  public STATE_Read(packet: NetPacket, size: number): void {
    packet.r_stringZ();
  }
}
