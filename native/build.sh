#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
clang++ --target=wasm32 -std=c++20 -O3 -nostdlib -fno-exceptions -fno-rtti native/src/chart.cpp -Wl,--no-entry -Wl,--export-all -Wl,--initial-memory=8388608 -Wl,--max-memory=16777216 -o native/chart.wasm
rustc --edition=2021 --target wasm32-unknown-unknown --crate-type cdylib -C opt-level=3 -C panic=abort -C strip=symbols -C link-arg=--initial-memory=2097152 native/src/weather.rs -o native/weather.wasm
