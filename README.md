# SCA test repo — JavaScript (npm), lock-less, worst case

Lock-less (no `package-lock.json`), so the scanner must generate one
(`npm install --package-lock-only`). Worst-case elements: an `overrides` field
(npm's version override, the analog of Go's `replace`) and a `devDependencies`
entry to test dev-vs-production scope.

See `EXPECTED_RESULTS.md` for the ground truth.

## Run it
1. New GitHub repo, e.g. `harshit905/sca-test-npm`.
2. `git remote add origin <url>` then `git push -u origin main`.
3. Scan in CodeAnt, compare to `EXPECTED_RESULTS.md`.

Do NOT commit `package-lock.json`.

Scan marker: 2026-10-01T04:37Z (fresh commit for the test-environment upgrade-impact run).
