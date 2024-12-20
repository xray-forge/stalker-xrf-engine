import { AnyArgs, AnyCallable, AnyObject, GameObject, Optional, TName } from "@/engine/lib/types";

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
 * Call global binding function.
 *
 * @param name - name of global binding
 * @param args - variadic list of arguments
 * @param container - container object
 * @returns generic value from binding function
 */
export function callBinding<T>(name: TName, args: AnyArgs = [], container: AnyObject = _G): T {
  checkBinding(name, container);

  return (container[name] as AnyCallable)(...args) as T;
}

/**
 * Call nested binding function.
 *
 * @param base - base name of global binding object
 * @param name - name of nested binding
 * @param args - variadic list of arguments
 * @param container - container object
 * @returns generic value from binding function
 */
export function callNestedBinding<T>(base: TName, name: TName, args: AnyArgs = [], container: AnyObject = _G): T {
  checkNestedBinding(base, name, container);

  return (container[base][name] as AnyCallable)(...args) as T;
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
 * Call condition similar to game scripts.
 *
 * @param name - name of condition binding
 * @param actor - current game actor object
 * @param object - target object to call condition for
 * @param parameters - list of parameters for the condition
 * @returns condition value
 */
export function callXrCondition(name: TName, actor: GameObject, object: GameObject, ...parameters: AnyArgs): boolean {
  const effects: Optional<AnyObject> = (_G as AnyObject)["xr_conditions"];

  if (!name) {
    throw new Error(`Unexpected condition name provided - '${name}'.`);
  }

  if (effects && name in effects) {
    const result = (_G as AnyObject)["xr_conditions"][name](actor, object, parameters);

    if (typeof result === "boolean") {
      return result;
    } else {
      throw new Error(
        `Unexpected call - 'xr_conditions' method '${name}' returned non boolean type '${typeof result}'.`
      );
    }
  } else if (!effects) {
    throw new Error("Unexpected call - 'xr_conditions' global is not registered.");
  } else {
    throw new Error(`Unexpected condition provided - '${name}', no matching methods in xr_conditions globals.`);
  }
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

/**
 * Call effect similar to game scripts.
 *
 * @param name - name of effect binding
 * @param actor - current game actor object
 * @param object - target object to call effect for
 * @param parameters - list of parameters for the effect
 */
export function callXrEffect(name: TName, actor: GameObject, object: GameObject, ...parameters: AnyArgs): void {
  const effects: Optional<AnyObject> = (_G as AnyObject)["xr_effects"];

  if (!name) {
    throw new Error(`Unexpected condition name provided - '${name}'.`);
  }

  if (effects && name in effects) {
    (_G as AnyObject)["xr_effects"][name](actor, object, parameters);
  } else if (!effects) {
    throw new Error("Unexpected call - 'xr_effects' global is not registered.");
  } else {
    throw new Error(`Unexpected effect provided - '${name}', no matching methods in xr_effects globals.`);
  }
}
