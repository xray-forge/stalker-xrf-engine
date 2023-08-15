# [XRF](../../../) / SRC / ENGINE / SCRIPTS

Main entry points of the game. <br/>
X-ray engine starts code execution of lua scripts from this place.

## start

Module is called every time game is loaded or new game is started. <br/>
Handles generic logics related to schemes, managers and extensions registration.

## bind

Module is called every time game is load or started. <br/>
Links client objects with LUA interceptors of client side logic.

## register

Module is called every time game is load or started. <br/>
Links client, server, script and configs objects together.

## declarations

Module contains declaration of global callbacks and event handlers. <br/>
Mainly declares functions accessible from engine or scripts.
