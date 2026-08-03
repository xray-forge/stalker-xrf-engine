type TActor = { alive: boolean };

function extern(name: string, value: unknown): void {}

/**
 * Check whether the actor is alive.
 *
 * @param actor - Actor to check.
 * @returns Whether the actor is alive.
 */
extern("xr_conditions.actor_alive", (actor: TActor): boolean => actor.alive);

/** A direct extern with an inferred return type. */
extern("dialogs.get_default_phrase", (): string => "default");

/** PDA callbacks and data. */
extern("pda", {
  get_name: (index?: number): string => `name-${index ?? 0}`,
  maximum: 3,
});
