# [XRTS](../README.md) / [DOCS](./README.md)

## 🏗️ Develop faster

To simplify development and test everything faster watch script or separate building steps can be used. <br/>
Also you can utilize your IDE to create RUN options and execute all the scripts with a single click (in WebStorm or VSCode).

#### Example: only lua scripts are being updated

- run `npm run build:scripts`

#### Example: only UI form changed

- run `npm run build:ui`, rebuild only UI forms

#### Example: only LTX config changed

- run `npm run build:configs`, rebuild only UI forms

### 🏗️ Use watch mode

For faster development scripts watch mode can be used. <br/>
To run project automated scripts building on changes use following command:

- run `npm run build:scripts`

As result any script file change will cause resulting gamedata to rebuild. <br/>
Also there is no need to restart the game .exe, just 'new game' option in menu will reload all the scripts from the file system.
