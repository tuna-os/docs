---
sidebar_position: 3
title: "Security"
---

ccleft follows the [TunaOS security policy](https://github.com/tuna-os/.github/blob/main/SECURITY.md).

## Supported versions

Security fixes land on `main`. Only the latest release and `main` are supported.

## Reporting a vulnerability

Do not open a public issue for security vulnerabilities.

Report privately with GitHub private vulnerability reporting on this
repository: open a
[new draft security advisory](https://github.com/tuna-os/ccleft/security/advisories/new)
(**Security -> Report a vulnerability**). Include the affected component, a
minimal reproduction, the impact, and a suggested fix if you have one.

Never include real credentials, tokens, or account identifiers in a report.
Redact captures first.

## Disclosure

The TunaOS policy aims to acknowledge reports within 5 business days. We prefer
coordinated disclosure: please allow a reasonable window for a fix before
publishing details.

## Scope

ccleft reads provider credentials read-only and must never refresh, rewrite, or
create credential files. Bugs that break that guarantee, leak secrets in output
or metrics, or mishandle upstream payloads are in scope. Vulnerabilities in the
provider services themselves should go to their own maintainers.
