import { communities } from "@/engine/lib/constants/communities";
import { TCount, TName, TNumberId } from "@/engine/lib/types";

/**
 * Mocked community relations registry.
 */
export const communityGoodwill: Record<TName, Record<TName, TCount>> = {
  [communities.actor]: {
    [communities.actor]: 1000,
    [communities.stalker]: 250,
    [communities.bandit]: 0,
    [communities.army]: 1000,
    [communities.monolith]: -1000,
    [communities.monster]: -1000,
  },
  [communities.stalker]: {
    [communities.stalker]: 1000,
    [communities.ecolog]: 500,
    [communities.actor]: 200,
    [communities.bandit]: -1000,
    [communities.army]: 0,
    [communities.monolith]: -1000,
    [communities.monster]: -1000,
    [communities.dolg]: 1000,
    [communities.zombied]: -5000,
  },
  [communities.bandit]: {
    [communities.bandit]: 1000,
    [communities.stalker]: -1000,
    [communities.actor]: -500,
    [communities.army]: -1000,
    [communities.monolith]: -1000,
    [communities.monster]: -1000,
  },
  [communities.dolg]: {
    [communities.stalker]: 500,
  },
  [communities.ecolog]: {
    [communities.stalker]: 500,
  },
  [communities.monolith]: {
    [communities.monolith]: 1000,
    [communities.actor]: -1000,
    [communities.stalker]: -1000,
    [communities.bandit]: -1000,
    [communities.army]: -1000,
    [communities.monster]: -1000,
  },
  [communities.army]: {
    [communities.army]: 1000,
    [communities.actor]: 1000,
    [communities.stalker]: 0,
    [communities.bandit]: -1000,
    [communities.monolith]: -1000,
    [communities.monster]: -1000,
  },
  [communities.monster]: {
    [communities.monster]: 3000,
    [communities.actor]: -5000,
    [communities.army]: -5000,
    [communities.stalker]: -5000,
    [communities.bandit]: -5000,
    [communities.monolith]: -5000,
  },
};

/**
 * Mocked characters relations registry.
 */
export const charactersGoodwill: Record<TNumberId, Record<TNumberId, TCount>> = {};

/**
 * Mock goodwill between characters by id.
 */
export function mockCharactersGoodwill(from: TNumberId, to: TNumberId, goodwill: TCount): void {
  if (!charactersGoodwill[from]) {
    charactersGoodwill[from] = {};
  }

  charactersGoodwill[from][to] = goodwill;
}
