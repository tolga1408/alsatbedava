#!/usr/bin/env bash
set -euo pipefail

project="${1:-$PWD}"
if [[ "${2:-}" == "--" ]]; then
  archive="${3:?usage: package-sites.sh PROJECT_DIR [--] ARCHIVE_PATH}"
else
  archive="${2:?usage: package-sites.sh PROJECT_DIR ARCHIVE_PATH}"
fi
build_dir="$project/dist"
hosting="$project/.openai/hosting.json"
migrations="$project/sites-drizzle"

test -f "$build_dir/server/index.js"
test -f "$hosting"
test -d "$migrations"

stage="$(mktemp -d)"
trap 'rm -rf "$stage"' EXIT

mkdir -p "$stage/dist/.openai/drizzle"
cp -R "$build_dir"/. "$stage/dist"/
cp "$hosting" "$stage/dist/.openai/hosting.json"
cp -R "$migrations"/. "$stage/dist/.openai/drizzle"/

mkdir -p "$(dirname "$archive")"
tar -C "$stage" -czf "$archive" dist

archive_entries="$(tar -tzf "$archive")"
grep -qx 'dist/server/index.js' <<<"$archive_entries"
grep -qx 'dist/.openai/hosting.json' <<<"$archive_entries"
grep -qx 'dist/.openai/drizzle/0000_private_beta.sql' <<<"$archive_entries"

printf '%s\n' "$archive"
