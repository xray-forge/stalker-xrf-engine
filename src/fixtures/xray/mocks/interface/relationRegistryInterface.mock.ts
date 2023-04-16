import { jest } from "@jest/globals";
import { IXR_relation_registry } from "xray16";

/**
 * todo;
 */
export const mockRelationRegistryInterface: IXR_relation_registry = {
  change_community_goodwill: jest.fn((community_a: string, value2: number, value3: number): void => {}),
  community_goodwill: jest.fn((community: string, object_id: number): number => {
    return -1;
  }),
  community_relation: jest.fn((community_a: string, community_b: string): number => {
    return -1;
  }),
  get_general_goodwill_between: jest.fn((from_id: number, to_id: number): number => {
    return -1;
  }),
  set_community_goodwill: jest.fn((community_a: string, value2: number, value3: number): void => {}),
  set_community_relation: jest.fn((community_a: string, community_b: string, value3: number): void => {}),
};
