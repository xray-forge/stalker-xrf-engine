/**
 * Friendly aliases and virtual enums for the xray16 engine bindings.
 *
 * Both the type aliases and the `@virtual` enums ship from the `xray16/alias` package module. The `inline`
 * plugin folds the enum members into literals in the gamedata Lua (the re-export require is stripped by the
 * `strip` plugin), while jest gets the real runtime enum values from the package.
 */
export * from "xray16/alias";
