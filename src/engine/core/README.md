# [XRF](../../../) / SRC / ENGINE / CORE

Engine logics of the game core written with lua (tstl).

## database

In-game registry. <br/>
Stores all the objects links handled by lua part or game caches. <br/>
Usually objects are added on register and removed on unregister.

## managers

Source code of managers objects. <br/>
Managers are modular handlers of some specific to them functionality (weather, loot, corpses removal etc).

## objects

Source code related to objects logic. <br/>
Handles server/client side logics of objects, animation and states of objects.

## schemes

Source code related to logics schemes definition and implementation. <br/>
Schemes are describing scenarios used by objects and are configured from ltx files.

## ui

Source code related to game UI implementation. <br/>
Describes how xml forms should be used by the game.

## utils

Source code related to game utility functions. <br/>
In most cases utils are pure functions that may reference game state/registry and are easy to test.
