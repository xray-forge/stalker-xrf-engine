# [XRF](../README.md) / [DOCS](./README.md)

## ️️🏗️ Building custom game package

XRF template provides CLI and utils for creation of custom game repacks. <br/>
Instead of building `gamedata` folder and distributing it as a separate `zip`, mods can be packed in `.db` archives
and bundled together with custom engine.

### 🏗️ Pre-requirements

Comparing to normal gamedata builds the only needed thing is full assets list. <br/>
To build package you will need [extended](https://gitlab.com/xray-forge/stalker-xrf-resources-extended) assets
and one of locales packs, for example [en](https://gitlab.com/xray-forge/stalker-xrf-resources-locale-en). <br/>

After cloning suggested repositories or providing custom assets, you should list them in 'config.json' if paths are different from already suggested.

### 🏗️ Running build

If assets are downloaded and configured correctly, the only needed thing is:

```
npm run cli pack game -- --clean --build --optimize

# or
npm run cli pack game -- -c -b -o

# or
npm run pack:game
```

As result, new package will be created in `target` folder.

If you want to 'just build' package for testing from existing assets without full build cycle, you can use alternative:

```
npm run cli pack game -- --engine release --build
```

### 🏗️ Assets links

- Extended assets: [https://gitlab.com/xray-forge/stalker-xrf-resources-extended](https://gitlab.com/xray-forge/stalker-xrf-resources-extended)
- EN locale assets: [https://gitlab.com/xray-forge/stalker-xrf-resources-locale-en](https://gitlab.com/xray-forge/stalker-xrf-resources-locale-en)
- UA locale assets: [https://gitlab.com/xray-forge/stalker-xrf-resources-locale-ukr](https://gitlab.com/xray-forge/stalker-xrf-resources-locale-ukr)
- RU locale assets: [https://gitlab.com/xray-forge/stalker-xrf-resources-locale-ru](https://gitlab.com/xray-forge/stalker-xrf-resources-locale-ru)
