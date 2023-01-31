# XRay-16 typescript definitions

<p>
Module contains xray engine globals typedefs for typescript. <br/>
By default x-ray export many bindings that can be used from lua scripts.

To check more details / correct typing you always can reference X-Ray source code.
Here we only try to represent correct types.
</p>

## Rules

Here are placed typings for x-ray engine. <br/>
For easier navigation and typing following rules are applied:

- Runtime accessible values should be re-exported with index.d.ts file
 - Type declaration should have docblock with matching c++ counterpart signature
 - Variable and class namings follow c++ conventions (underscore etc)
 - Class declarations are preferred instead of interfaces
 - XRay types should be prefixed with XR or TXR in case of types
 - If method is not native to X-Ray engine and was added in one of updates, mark it with comment annotation if possible

## Extending C++ classes

<p>
C++ classes can be extended in Lua code with 'class' keyword. 
Class declaration registers table as userdata and adds constructor/destructor metamethods. <br/>
In TS codebase 'declare_xr_class' function can be used.

</p>

## How to get up-to-date LUA bindings

- Run game engine with ```-dump_bindings``` flag
- Check userdata folder ```scriptbindings_*.txt``` files

## References

- X-Ray C++ source code
- LuaBind sources and docs
