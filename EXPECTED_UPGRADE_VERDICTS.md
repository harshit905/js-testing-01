# Expected upgrade-impact verdicts (JavaScript / npm)

Ground truth for the SCA "Check upgrade" agent. Targets are the highest first-patched
version across the package's advisories (Oct 2026).

| package | installed | expected target | expected verdict | why |
|---|---|---|---|---|
| axios | 0.21.1 | 0.33.0 (the scanner picks the 0.x branch's first patched version, not 1.x) | **NEEDS CHANGES**, HIGH | `src/http.ts` imports the `AxiosTransformer` type; axios 0.28+ backported the 1.x typings, so it is removed in 0.33.0 too (TypeScript diff: "Export was removed", verified locally); `tsc --noEmit` fails on it. The `axios.create`/`.get` calls in `index.js` are fine |
| lodash | 4.17.11 | 4.18.0 | **SAFE**, MEDIUM | `_.merge` and `_.template` only; lodash ships no types, so there is no API diff — verdict rests on release notes + `tsc` (which does not cover `index.js`). Watch what the agent does with no diff |
| lod (alias of lodash) | 4.17.15 | 4.18.0 | **SAFE**, MEDIUM | `lod3.pick` only. Alias edge case: the manifest key is `lod`, so the resolver bump lands in `overrides` |
| tough-cookie | ~2.3.0 -> 2.3.4 | 4.1.3 (major) | **SAFE**, MEDIUM | `CookieJar`, `setCookieSync`, `getCookieStringSync` all exist in 4.x; 2.3 ships no types |
| ini | 1.3.5 (optional) | 1.3.6 | **SAFE**, HIGH | patch fix; `ini.parse` unchanged |
| underscore | 1.12.0 (dev) | 1.13.8 | **SAFE**, MEDIUM | dev-only, not imported by app code (declared only); DEV scope |
| minimist | overridden to 1.2.8 | — | not vulnerable | the override already pins the fix; nothing to assess |

## Traps built in
- `lib/decoy.js` defines a local `transformRequest` function and a string constant named `AxiosTransformer`. A grep hits both; neither is a use of axios.
- `src/http.ts` is the only TypeScript file; the execution check must run `tsc` there and report the `AxiosTransformer` error.
