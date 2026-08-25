# Changelog

## Unreleased

### Added
- Weighted experiment registration with exact 100% allocation validation.
- Deterministic SHA-256 assignment buckets.
- Experiment listing, health, and readiness endpoints.
- Expanded lifecycle and validation tests.
- CI build, test, dependency-audit, Docker-build, and non-root gates.
- Security and SKYCOIN4444 integration documentation.

### Changed
- Replaced the weak character-sum assignment with a stable cryptographic hash bucket.
- Repositioned the repository as an engineering-beta experimentation component.

### Known limitations
- In-memory configuration only.
- No exposure-event analytics, statistical analysis, RBAC, tenant isolation, or verified production deployment.
