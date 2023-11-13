## todo: scripts logic ini fields descriptions. Move to xrf book?

## Logic fields

- `spawn` - [string] name of section describing items to spawn on section activation
- `suitable` - [string] whether described script job is suitable
- `prior` - [number] priority ???
- `on_death` [condlist] - section activation on object death
- `camp` [?] -

## Base section fields

- `combat_ignore_cond` - ???
- `combat_ignore_keep_when_attacked` - ???
- `meet` - ???
- `invulnerable` - ???
- `gather_items_enabled` - whether stalker can loot items from corpses nearby if any detected, true by default
- `help_wounded_enabled` - whether stalker can help wounded if injured nearby are detected, true by default
- `corpse_detection_enabled` - ???
- `use_camp` - [boolean] whether object can use camp logic (stories, guitar, harmonica), true by default
