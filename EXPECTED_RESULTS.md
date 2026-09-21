# Expected SCA results — ground truth (JavaScript / npm)

Lock-less (no `package-lock.json`), so generation runs. Every package has a
predictable outcome.

## Summary

| bucket | packages |
|--------|----------|
| Vulnerable | `lodash@4.17.11` (prod), `underscore@1.12.0` (dev) |
| Healthy | `minimist@1.2.8`, `debug@2.6.9` (overridden), `ms` (transitive of debug) |
| Unresolved | none |

## Vulnerabilities
- **`lodash@4.17.11`** — prototype pollution, `CVE-2019-10744`
  (`GHSA-jf85-cpcp-j695`) and others (all fixed by 4.17.21). Zero deps. Production.
- **`underscore@1.12.0`** — arbitrary code execution via `_.template`,
  `CVE-2021-23358`, fixed in 1.12.1. Zero deps. **Development scope.**

## Healthy
- **`minimist@1.2.8`** — the range `^1.2.0` resolves to `1.2.8` (latest 1.x),
  which is patched. Tests range resolution.
- **`ms`** — transitive dependency of `debug`, healthy. Proves transitive
  discovery.

## Worst-case feature 1 — the `overrides` field (the main thing to analyze)
`dependencies` declares `debug: 2.6.8` (vulnerable, ReDoS `CVE-2017-16137`), but
`overrides` forces `debug` to `2.6.9` (patched), which is what npm installs.

- **CORRECT:** the SCA reports `debug@2.6.9` as **healthy**. It read the generated
  lock, which honors `overrides`.
- **FINDING (a real bug to flag):** the SCA reports `debug@2.6.8` as
  **vulnerable**. That means it read the `dependencies` version textually and
  ignored `overrides`, scanning a version npm never installs.

## Worst-case feature 2 — dev-vs-production scope
`underscore` is in `devDependencies`. A correct SCA flags its vuln AND marks its
scope as **development**, not production. If it says production, that is a
classification finding.

## Pass / fail
- PASS: lodash and underscore vulnerable; underscore marked DEV; minimist@1.2.8
  and debug@2.6.9 healthy; 0 unresolved.
- FINDINGS: debug shown at 2.6.8 (overrides ignored), underscore marked
  production, 0 vulns (false all-clear), or any invented version.
