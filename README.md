# RealmFlow

**Live app:** https://realm-flow.vercel.app  
**Onyx registry:** `gno.land/r/g1832jd5gytypzj48d0328r2sqvv2x38zj0zryuq/realmflow2`  
**Demo video:** <add demo video URL>

## 15-second pitch

RealmFlow helps Gno realm builders and QA testers compose, run, debug, and share multi-step realm scenarios in a browser without requiring the gnokey CLI.

```text
Realm functions             Scenario builder             Output
vm/qfuncs + vm/qfile  →   ordered calls + assertions  → results / panic explainer
                                ↓                                 ↑
                         shareable ?s= link        Adena transactions / vm/qeval
                                ↓
                     on-chain registry + Render catalog
```

## Why this only works on Gno.land

Unlike EVM chains that typically require an off-chain ABI, Gno exposes these realm capabilities directly:

| Gno feature | RealmFlow use |
| --- | --- |
| `vm/qfuncs` | Discover live exported functions and their parameters. |
| `vm/qfile` | Inspect on-chain realm source. |
| `vm/qrender` | Preview a realm's `Render()` Markdown. |
| `vm/qeval` | Run read-only expressions against live state. |
| `cur realm` | Recognize runtime-injected realm parameters and omit them from user arguments. |
| Registry `Render()` | Browse a Markdown scenario catalog and detail pages in gnoweb. |

## Judging criteria alignment

| Criterion | Evidence |
| --- | --- |
| Technical Quality (40%) | ABCI RPC integration for Onyx (`onyx-1`) and Mainnet (`gnoland-1`); `cur realm` parameter filtering; `{{stepN.output}}` chaining; registry realm and unit tests in `realms/realmflow_registry`. |
| User Appeal (20%) | Three-pane IDE, one-click Copy gnokey CLI, shareable `?s=` URLs, and Demo Mode when RPC or a wallet is unavailable. |
| Creativity (20%) | Multi-step scenarios go beyond browsing in gnoweb; `VerifyScenario` records on-chain verification transactions; the Gno VM Panic Explainer offers plain-English guidance. |
| Docs & Demo (20%) | Setup and deployment commands below, plus a 90-second demo checklist. |

## Setup

Requires Node.js, npm, and optionally the Adena browser wallet. The development proxy forwards ABCI requests to the selected RPC.

```bash
npm install
npm run dev
```

Open the URL printed by Vite. Live Mode starts on Onyx and loads the Gno.land blog; enable Demo Mode to explore sample realms offline. Select Onyx, Mainnet, or a custom RPC. Connect Adena for state-changing calls. The default registry is `gno.land/r/g1832jd5gytypzj48d0328r2sqvv2x38zj0zryuq/realmflow2`; set `VITE_REGISTRY_REALM` before building or change the registry path in Settings. Settings take precedence over the environment default. Use a registry deployed on the selected network.

```bash
# Example: configure your deployed registry for a build
VITE_REGISTRY_REALM=gno.land/r/g1832jd5gytypzj48d0328r2sqvv2x38zj0zryuq/realmflow2 npm run build
```

On PowerShell, set `$env:VITE_REGISTRY_REALM` before running `npm run build`. Scenario links and published payloads are public; do not include secrets.

## Registry tests and deployment

Install Gno tooling and configure a funded key for Onyx. The module path in `gno.mod` and `gnomod.toml` must match the path you deploy; update both for your namespace. The catalog's app link currently points to the existing app URL at the top of this README; update it in `realmflow.gno` if your deployment moves.

```bash
cd realms/realmflow_registry
gno test
# After setting the module path for your namespace:
gnokey maketx addpkg -pkgpath gno.land/r/<your_namespace>/realmflow_registry \
  -pkgdir . -gas-fee 2000000ugnot -gas-wanted 20000000 \
  -chainid onyx-1 -remote https://rpc.latest.testnets.gno.land:443 \
  -broadcast <your_key>
```

Set the deployed path in Settings, switch off Demo Mode, and connect Adena. Publish a scenario, then open Community Scenarios to load it or submit **Verify On-Chain**. A verification count records submitted verification calls; it does not prove that a test was run or passed, and is not restricted to unique testers. Refresh after the transaction is confirmed to see the updated count.

## 90-second demo checklist

- **0–15s:** State the pitch and show the three panes and Why Gno-Only explanation.
- **15–35s:** Discover a realm's live functions; inspect source and `Render()` output.
- **35–55s:** Add two calls, insert `{{step1.output}}`, run, and show output or the panic explainer. Use Demo Mode if live RPC is unavailable.
- **55–70s:** Copy a gnokey command and share a runnable scenario link.
- **70–90s:** On a deployed registry, publish with Adena, browse the catalog in gnoweb, and submit a verification from Community Scenarios.

## Validation

```bash
npm test
npm run build
cd realms/realmflow_registry && gno test
```
