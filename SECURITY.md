# Security Policy

Sky A/B Testing is an engineering-beta service. Its administration and assignment endpoints do not currently implement authentication or authorization, and experiment configuration is stored only in process memory.

Do not expose the service directly to untrusted networks or use variant assignment as an authorization/security decision. Keep user identifiers pseudonymous where practical and do not place secrets or sensitive personal data in experiment names or payloads.

The supplied container runs as a non-root user. CI performs dependency auditing, but that does not establish that the service is production-secure. Production adoption should add authenticated administration, RBAC, durable audit history, tenant isolation, rate limiting, deployment TLS, observability, and a reviewed data-retention policy.
