# Expected SCA results — ground truth (JavaScript / npm)

Lock-less (no `package-lock.json`), so generation runs
(`npm install --package-lock-only`). Every package has a predictable outcome.

## Summary

| bucket | packages |
|--------|----------|
| Vulnerable | `lodash@4.17.11` (prod), `underscore@1.12.0` (dev) |
| Healthy | `mkdirp@0.5.1`, `semver@7.x`, `minimist@1.2.8` (overridden transitive) |
| Unresolved | none |

## Vulnerabilities
- **`lodash@4.17.11`** — prototype pollution, `CVE-2019-10744` and others (fixed
  by 4.17.21). Zero deps. Production, direct.
- **`underscore@1.12.0`** — arbitrary code execution via `_.template`,
  `CVE-2021-23358`, fixed in 1.12.1. Zero deps. **Development scope.**

## Healthy
- **`mkdirp@0.5.1`** — no advisories; its only dependency is `minimist` (below).
- **`semver@7.x`** — the range `^7.0.0` resolves to the latest 7.x (>= 7.5.2,
  which is patched for `CVE-2022-25883`). Tests range resolution.
- **`minimist@1.2.8`** — see the override test below.

## Worst-case feature 1 — the `overrides` field (the main thing to analyze)
`mkdirp@0.5.1` normally pulls the transitive `minimist@0.0.8`, which is vulnerable
(prototype pollution, `CVE-2020-7598`). The `overrides` field forces `minimist`
to `1.2.8` (patched), which is what npm installs.

- **CORRECT:** the SCA reports `minimist@1.2.8` as **healthy**. It read the
  generated lock, which honors `overrides`.
- **FINDING (a real bug to flag):** the SCA reports `minimist@0.0.8` as
  **vulnerable**, meaning it ignored `overrides`.

## Worst-case feature 2 — dev-vs-production scope
`underscore` is in `devDependencies`. A correct SCA flags its vuln AND marks its
scope as **development**. If it says production, that is a classification finding.

## Pass / fail
- PASS: lodash and underscore vulnerable; underscore marked DEV; mkdirp, semver,
  and `minimist@1.2.8` healthy; 0 unresolved.
- FINDINGS: minimist shown at 0.0.8 (overrides ignored), minimist unresolved or
  missing (generation failed / no transitive), underscore marked production, or
  any invented version.

## Note on the previous version of this fixture
The first version used `overrides: { "debug": "2.6.9" }` against a direct
dependency `debug: "2.6.8"`. npm rejects that with `EOVERRIDE` ("Override for
debug conflicts with direct dependency"), because a direct dependency cannot be
overridden to a version outside its own spec. That is why the earlier scan showed
generation failing (minimist unresolved, no healthy packages) — a malformed
manifest, not a scanner bug. npm `overrides` are for **transitive** versions,
which is what this version tests.

## New edge case (regression re-test) — scoped devDependency
`devDependencies` adds `@types/semver@7.5.0` (a scoped package name).
- **PASS:** `@types/semver@7.5.0` is healthy and marked **dev** scope.
