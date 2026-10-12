# Helmlore new navigation 1.0

Separate test page: `/native/`. Original `/navigation.html` is untouched.

This is a browser application using **C++ and Rust compiled to WebAssembly**, plus the existing JavaScript/Leaflet user interface. It is not a native iPad executable or an all-C++/Rust rewrite.

- C++: chart geometry bounds, batched viewport/layer filtering, depth-label decluttering.
- Rust: validated-frame wind interpolation and circular wave interpolation, preserving missing sea cells and the original data.
- Background worker: gzip decompression, chart JSON decoding and C++ bounds calculations.
- Canvas: sounding labels replace hundreds of permanent DOM tooltips. Other chart geometries and menus remain Leaflet/JavaScript.
- Local caching: visited historical tiles saved after record-count verification; visible-area download caches every intersecting scale, up to 1,500 tiles per request. Existing verified full-chart package remains usable.
- The native viewer has its own `/native/` service worker and cache. It does not delete the old viewer cache. Existing chart package metadata and vessel/routes are intentionally shared so a user does not lose saved work.

The underlying chart sources retain their original dates (historical depth archive: 2011). Weather uses the same ECMWF/Open-Meteo feeds and IndexedDB forecast storage as the previous build. API availability, offline browser storage retention, and Leaflet rendering still affect performance. No speedup claim is made before an iPad comparison.

## Rebuild

Install clang/lld and Rust with the `wasm32-unknown-unknown` target, then run:

```sh
bash native/build.sh
npm exec --yes --package=esbuild -- esbuild native/weather/mount.mjs --bundle --minify --outfile=native/weather.js --format=iife --target=safari16
node --test native/tests/engine.test.mjs
```

WebAssembly modules are committed alongside their source for static GitHub Pages hosting. Compilers require no deployment server.

## Validation

Compiled-module tests compare actual C++/Rust exports with original calculations, real ECMWF seed data, missing cells, direction wraparound, grid boundaries, layer masks and depth-label selection. Browser/iPad rendering requires device testing. WebAssembly failures show a startup error and a link to the original page; there is no silent JavaScript fallback.
