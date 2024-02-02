import { ammo } from "@/engine/lib/constants/items/ammo";
import { medkits } from "@/engine/lib/constants/items/drugs";
import { weapons } from "@/engine/lib/constants/items/weapons";
import { GameObject, ServerObject } from "@/engine/lib/types";
import { IMockGameObjectConfig, MockGameObject } from "@/fixtures/xray/mocks/objects/game";
import { MockAlifeObject } from "@/fixtures/xray/mocks/objects/server";

/**
 * @returns generic object with some items in inventory
 */
export function createObjectWithItems(): GameObject {
  return MockGameObject.mock({
    inventory: [
      [1, MockGameObject.mock({ section: medkits.medkit })],
      [2, MockGameObject.mock({ section: medkits.medkit })],
      [3, MockGameObject.mock({ section: medkits.medkit_army })],
      [4, MockGameObject.mock({ section: medkits.medkit_army })],
      [5, MockGameObject.mock({ section: medkits.medkit_army })],
      [40, MockGameObject.mock({ section: weapons.wpn_svd })],
      [41, MockGameObject.mock({ section: weapons.wpn_svd })],
      [50, MockGameObject.mock({ section: ammo.ammo_9x18_pmm })],
      [51, MockGameObject.mock({ section: ammo.ammo_9x18_pmm })],
      [52, MockGameObject.mock({ section: ammo.ammo_9x18_pmm })],
      [53, MockGameObject.mock({ section: ammo.ammo_9x18_pmm })],
      [54, MockGameObject.mock({ section: ammo.ammo_9x18_pmm })],
      [55, MockGameObject.mock({ section: ammo.ammo_9x18_pmm })],
    ],
  });
}

/**
 * @param config - configuration of game object mock
 * @returns tuple with game and server object
 */
export function mockInSimulator(config: IMockGameObjectConfig = {}): [GameObject, ServerObject] {
  const object: MockGameObject = new MockGameObject(config);
  const serverObject: ServerObject = MockAlifeObject.mock({ section: object.section(), id: object.id() });

  return [object.asGameObject(), serverObject];
}
