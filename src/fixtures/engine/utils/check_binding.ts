import { AnyObject, TName } from "@/engine/lib/types";

/**
 * Expect binding to be defined in global container.
 *
 * @param name - name of global binding
 * @param container - container object, defaults to `global`
 */
export function checkBinding(name: TName, container: AnyObject = _G): void {
  if (!container[name]) {
    throw new Error(`Expected '${name}' extern to be declared.`);
  }
}

/**
 * Expect binding to be defined in nested global container.
 *
 * @param base - name of global binding base object
 * @param name - name of global binding
 * @param container - container object, defaults to `global`
 */
export function checkNestedBinding(base: TName, name: TName, container: AnyObject = _G): void {
  if (!container[base]) {
    throw new Error(`Expected '${base}' extern container to be declared.`);
  } else if (!container[base][name]) {
    throw new Error(`Expected '${name}' extern to be declared.`);
  }
}

/**
 * Expect condition binding to be defined in nested global container.
 *
 * @param name - name of condition binding
 * @param container - container object, defaults to `global`
 */
export function checkXrCondition(name: TName, container: AnyObject = _G): void {
  return checkNestedBinding("xr_conditions", name, container);
}

/**
 * Expect effect binding to be defined in nested global container.
 *
 * @param name - name of effect binding
 * @param container - container object, defaults to `global`
 */
export function checkXrEffect(name: TName, container: AnyObject = _G): void {
  return checkNestedBinding("xr_effects", name, container);
}
