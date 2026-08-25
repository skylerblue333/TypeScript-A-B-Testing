# Sky A/B Testing

A focused TypeScript/Express service for deterministic weighted experiment assignment. This repository is an engineering-beta component, not a hosted experimentation platform.

## Implemented behavior

- Register named experiments with 2–20 variants.
- Require integer variant weights that total exactly 100.
- Reject duplicate experiment names and duplicate variant names.
- Deterministically assign a user to a variant using SHA-256 of the experiment name and user identifier.
- List configured experiments.
- Health and readiness endpoints.
- Bounded JSON request bodies and validated request fields.
- Automated TypeScript build, Jest tests, dependency audit, Docker build, and non-root image verification.

A built-in `homepage-redesign` example remains available for local demonstration.

## Run locally

```bash
npm ci
npm run build
npm test -- --runInBand
npm start
```

The service listens on port `8080`.

Create an experiment:

```json
{
  "name": "checkout-copy",
  "variants": [
    { "name": "control", "weight": 50 },
    { "name": "short-copy", "weight": 50 }
  ]
}
```

Submit it to `POST /api/v1/experiments`, then assign with `POST /api/v1/assign` using a body such as:

```json
{
  "user_id": "user-123",
  "experiment": "checkout-copy"
}
```

The same experiment/user pair receives the same variant while the experiment definition is unchanged.

## Architecture

`src/index.ts` contains the HTTP boundary, Zod schemas, deterministic bucket function, and in-memory experiment registry. This intentionally keeps the repository small and inspectable.

## SKYCOIN4444 integration

The service can provide deterministic experiment assignment for SKYCOIN4444 UI, feed, marketplace, or product experiments through its HTTP interface. Integrations should preserve the stable experiment/user identifiers used for assignment.

## Status and limitations

**Status: Engineering Beta.** Automated verification is present, but deployment has not been verified.

The current service keeps experiments in process memory. It does not provide durable storage, experiment editing/history, exposure-event collection, statistical analysis, identity governance, tenant isolation, RBAC, distributed consistency, or production deployment. It is not GA or enterprise-ready.

See `SECURITY.md` and `CHANGELOG.md` for operating boundaries and productization history.
