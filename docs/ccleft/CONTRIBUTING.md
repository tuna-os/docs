---
sidebar_position: 2
title: "Contributing"
---

Thanks for contributing. This document covers the local development loop; see
[README.md](https://github.com/tuna-os/ccleft/blob/main/README.md) for project behavior and public APIs. Participation is
governed by the
[TunaOS Code of Conduct](https://github.com/tuna-os/.github/blob/main/CODE_OF_CONDUCT.md).

## Contribute compute — no code needed

**[Donate time with your AI CLI](https://hub.tunaos.org/#contribute).**

Your machine runs one task at a time using your signed-in AI coding CLI.
The relay alternates between eligible **School** (OS) and **Reef** (apps)
hives after each task. If one hive has no work, the other can continue.

The guide covers prerequisites, verified `just` setup, credentials, provider
costs, and how to stop with Ctrl+C. Your subscription quota or API charges apply.
Never post account credentials or API keys in issues or pull requests.

## Set up

- Install Go 1.24 or newer (see `go.mod`).
- Clone the repository and download dependencies with `go mod download`.
- Install Docker only when changing the `Dockerfile` or running the `docker`
  CI job locally.
- Install a C compiler such as `gcc` to run tests with `-race`; plain
  `go test` does not require one.

Build the library and CLI:

```
go build ./...
```

## Build and test

Run the same checks CI runs, in this order:

```
gofmt -l .                        # must print nothing
go vet ./...
go test -race -count=1 ./...      # drop -race if no C compiler is available
CGO_ENABLED=0 go build -trimpath -o /dev/null ./cmd/ccleft
```

If `gofmt -l .` prints any file paths, run `gofmt -w .` before committing.

For `Dockerfile` changes, also run `docker build -t ccleft:local .`.

Provider behavior is tested with `httptest` servers and recorded payloads under
[`testdata/`](https://github.com/tuna-os/ccleft/blob/main/testdata/README.md). Tests must not contact live provider APIs or
require credentials. `live_test.go` means its fixtures originated from
live verification; the tests still run offline. When live verification is
needed, use a read-only account, redact the response before adding it, and
record its provenance in `testdata/README.md`.

## Add or change a provider

Keep provider-specific credential discovery and response parsing in its own
file. Follow an existing implementation and complete each part:

1. Add the provider name and public state/window vocabulary in `reading.go`.
2. Implement and register an `impl` with separate `identify` and `fetch`
   functions. `identify` reads local credentials without network access;
   `fetch` performs the bounded upstream request or CLI invocation.
3. Derive every credential path from `Source.Home` or an explicit source
   environment override. Never use the process's home implicitly.
4. Add the provider timeout to `DefaultTimeouts`, and update detection or CLI
   configuration when automatic discovery applies.
5. Map the response to normalized `Window` values. Set `Kind`, `Unit`,
   `Binding`, usage values, and reset time deliberately; use `deriveState`
   where the standard window rules apply.
6. Add synthetic or redacted fixtures, `httptest` coverage for successful and
   failure responses, and update the provider tables in `README.md`.

Use existing error helpers and preserve upstream context:

- `auth_required`: credentials are absent, expired, or rejected.
- `rate_limited`: the quota endpoint itself throttled the request.
- `unsupported`: the login or provider has no quota source to query.
- `error`: network, timeout, schema, or other measurement failure.

Do not turn an unrecognized response into an `ok` reading. Return a stable
machine-readable cause plus a useful wrapped error, without exposing secrets.

## Security-sensitive changes

ccleft is read-only by design (see README's Security section). It must never
write, refresh, or change permissions on credential files, and it must never
shell out to a CLI that could mutate one (`codex`, `claude`). Call out changes
to credential discovery or the `agy` execution path in the PR description.
Fixtures must contain no real tokens, account identifiers, or personal data.

## Submit a pull request

1. Branch from `main` using the organization prefixes `fix/`, `feat/`,
   `chore/`, or `arch/`.
2. Use Conventional Commit subjects, such as `fix: ...` or `docs: ...`.
3. Sign off every commit for DCO compliance with `git commit -s`.
4. Run the checks above and update docs or fixture provenance affected by the
   change.
5. Open a focused PR that explains behavior, tests, and any credential or live
   verification work.

A TunaOS maintainer reviews and merges after required CI checks pass and review
feedback is resolved. This repository is maintained directly rather than as a
fork; no upstream synchronization step is required. Keep [NOTICE](https://github.com/tuna-os/ccleft/blob/main/NOTICE)
accurate when importing or adapting external work.

## License

By contributing, you agree that your contribution is licensed under
Apache-2.0 (see [LICENSE](https://github.com/tuna-os/ccleft/blob/main/LICENSE)).
