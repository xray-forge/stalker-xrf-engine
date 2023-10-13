import { newIntegerField, newStringField } from "#/utils/ltx";

/**
 * Configuration of game alife processing.
 * Includes settings with frequency/quantity of server objects updates when they are not in client radius.
 */
export const config = {
  alife: {
    schedule_min: newIntegerField(1, { comment: "milliseconds" }),
    schedule_max: newIntegerField(1, { comment: "milliseconds" }),
    process_time: newIntegerField(3_000, { comment: "microseconds, 2ms" }),
    update_monster_factor: 0.1,
    time_factor: 10,
    normal_time_factor: 10,
    // Alife server-client switch distance.
    switch_distance: 150,
    /**
     * Alife server-client switch multiplier.
     * Implements gray zone and prevent online-offline switch on active movement.
     * By default, 10% is considered enough.
     */
    switch_factor: 0.1,
    start_time: "9:00:00",
    start_date: "03.08.2012",
    autosave_interval: "01:05:00",
    delay_autosave_interval: "00:00:30",
    objects_per_update: 20,
    // Time for object spawn after game loaded when infinite count of objects can be updated.
    object_initial_spawn_buffer_time: 3000,
    start_game_callback: newStringField("start.callback", {
      comment: "on starting new game or loading saved one -> start.ts root",
    }),
  },
};
