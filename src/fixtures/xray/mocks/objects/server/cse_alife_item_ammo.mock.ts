import { ServerItemAmmoObject } from "@/engine/lib/types";
import { MockAlifeItem } from "@/fixtures/xray/mocks/objects/server/cse_alife_item.mock";
import { IMockAlifeObjectConfig } from "@/fixtures/xray/mocks/objects/server/cse_alife_object.mock";

/**
 * Mock alife ammo item server object.
 */
export class MockAlifeItemAmmo extends MockAlifeItem {
  public static override mock(config: IMockAlifeObjectConfig = {}): ServerItemAmmoObject {
    return new this(config) as unknown as ServerItemAmmoObject;
  }
}
