# Expected SCA results — ground truth (JavaScript / npm)

Lock-less (no `package-lock.json`), so generation runs
(`npm install --package-lock-only`). Every package has a predictable outcome.

## Summary

| bucket | packages |
|--------|----------|
| Vulnerable | `lodash@4.17.11` (prod), `underscore@1.12.0` (dev), `lodash@4.17.15` (via alias `lod`), `tough-cookie@2.3.4` (range), `ini@1.3.5` (optional) |
| Healthy | `mkdirp@0.5.1`, `semver@7.x`, `minimist@1.2.8` (overridden transitive), `@types/semver@7.5.0` (dev), `punycode@1.4.1` (transitive) |
| Unresolved | none |

`local-widget` is a `file:` link to the repo's own code and is excluded from the
resolved graph (or shown healthy at 1.0.0; either is fine).

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

## Round 2 edge cases

### A. npm alias (`"lod": "npm:lodash@4.17.15"`)
The dependency key is `lod` but the real package is `lodash`, at a second
version. The generated lock records `node_modules/lod` with `"name": "lodash"`.
- **PASS:** a second `lodash@4.17.15` entry, **vulnerable** (`CVE-2020-8203`,
  `CVE-2021-23337`, fixed 4.17.19 / 4.17.21), alongside `lodash@4.17.11`.
- **FAIL:** an entry named `lod` (unresolved or "healthy" because no advisory
  matches that name), or only one lodash version.

### B. Range that resolves to a still-vulnerable version (`tough-cookie ~2.3.0`)
`~2.3.0` resolves to `2.3.4`, the last 2.3.x. It is vulnerable to
`CVE-2023-26136` (prototype pollution, fixed 4.1.3). Pulls `punycode@1.4.1`
(healthy transitive).
- **PASS:** `tough-cookie@2.3.4` vulnerable; `punycode@1.4.1` healthy.
- **FAIL:** tough-cookie unresolved (range not resolved) or healthy.

### C. `optionalDependencies` scope (`ini@1.3.5`)
`ini@1.3.5` is vulnerable (`CVE-2020-7788`, prototype pollution, fixed 1.3.6).
Zero deps. The lock marks it `"optional": true`.
- **PASS:** `ini@1.3.5` vulnerable, scope **production** (or "optional"), not dev.
- **FAIL:** ini missing (optional deps dropped) or marked dev.

### D. `file:` local dependency (`local-widget`)
`"local-widget": "file:./local-widget"`. The manifest directory must be copied
whole; if only `package.json` is copied, `npm install --package-lock-only` dies
with `ENOENT ... local-widget/package.json` and the WHOLE generation fails.
- **PASS:** generation succeeds; `local-widget` is excluded or healthy at 1.0.0;
  every other result above is unchanged.
- **FAIL:** 0 healthy / everything unresolved / 0 vulns (false all-clear).

### Round 2 pass / fail (combined)
- PASS: 5 vulnerable (`lodash@4.17.11`, `lodash@4.17.15`, `tough-cookie@2.3.4`,
  `ini@1.3.5`, `underscore@1.12.0` dev); healthy `mkdirp`, `semver`,
  `minimist@1.2.8`, `@types/semver`, `punycode@1.4.1`; 0 unresolved.

## Round 3 edge cases — dev-only transitives

### A. A transitive only a devDependency pulls in (`strip-ansi 3.0.1`, dev)
`strip-ansi@3.0.1` is healthy and only needed in development. It pulls
`ansi-regex@2.1.1`, which is vulnerable (`CVE-2021-3807` ReDoS, no 2.x fix) and
is reachable from no production dependency.
- **PASS:** `strip-ansi@3.0.1` healthy, **DEV**, direct; `ansi-regex@2.1.1`
  vulnerable, **DEV**, transitive.
- **FAIL:** `ansi-regex@2.1.1` marked PROD (the lock's dev-only status ignored).

### B. A transitive shared by a devDependency and a dependency (`optimist 0.6.1`, dev)
`optimist@0.6.1` (dev) pulls `wordwrap@0.0.3` (dev-only, healthy) and
`minimist`, which the production `mkdirp` also pulls (and `overrides` pins to
1.2.8).
- **PASS:** `wordwrap@0.0.3` healthy **DEV** transitive; `minimist@1.2.8` stays
  **PROD** (shared with a production dependency wins).
- **FAIL:** `minimist` flips to DEV, or `wordwrap` shows PROD.
