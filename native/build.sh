#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
clang++ --target=wasm32 -std=c++20 -O3 -nostdlib -fno-exceptions -fno-rtti native/src/comfort.cpp -Wl,--no-entry -Wl,--export-all -o native/comfort.wasm
rustc --edition=2021 --target wasm32-unknown-unknown --crate-type cdylib -C opt-level=3 -C panic=abort -C strip=symbols -C link-arg=--initial-memory=2097152 native/src/weather.rs -o native/weather.wasm
