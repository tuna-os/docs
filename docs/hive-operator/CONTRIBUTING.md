---
sidebar_position: 2
title: "Contributing"
---

hive-operator is a Go Kubernetes operator. It reconciles Hive custom resources, publishes metrics, and moves selected Hive operations from shell CronJobs into controllers. Read [README.md](https://github.com/tuna-os/hive-operator/blob/main/README.md) for current controller status and [DESIGN.md](https://github.com/tuna-os/hive-operator/blob/main/DESIGN.md) before changing reconciliation or shadow-diff behaviour.

## Prerequisites

Install or provide these before running commands:

- Git.
- Go 1.27.2 or newer. The module declares Go 1.26.0; CI pins its exact Go version in `.github/workflows/image.yml` (`go-version`), and both container build files use the `golang:1.27` image.
- GNU Make for the repository targets in `Makefile`.
- `kubectl` and a kubeconfig for `make deploy`, `make run`, sample resources, and shadow-diff checks. Unit tests and local builds do not need a cluster.
- Docker for `make docker-build` and `make docker-build-usage`.
- Network access to download Go modules. Manifest generation runs `controller-gen` through `go run`; no global controller-tools install is required.

Confirm the Go toolchain before starting:

```sh
go version
```

Do not point sample or promotion commands at a production cluster. The sample resources include `Enforce` modes and are intended for a disposable or explicitly authorized Hive environment.

## Checkout and repository layout

```sh
git clone https://github.com/tuna-os/hive-operator.git
cd hive-operator
```

Important paths:

- `api/v1alpha1/` — custom-resource types and generated deepcopy code.
- `internal/controller/` — reconcilers and Kubernetes integration.
- `internal/rotation/`, `internal/liveness/`, and `internal/usage/` — controller policy and usage logic.
- `cmd/` — manager, shadow-diff, and usage-sidecar entry points.
- `config/crd/`, `config/rbac/`, and `config/manager/` — generated and deployment manifests.
- `config/samples/` and `config/usage/` — example resources.
- `docs/` — promotion and operational runbooks.

## Build, format, generate, and test

The Makefile keeps generated artifacts reproducible and invokes `controller-gen` through a pinned `go run` version.

```sh
make generate     # update api/v1alpha1 generated deepcopy code
make manifests    # update config/crd and config/rbac
make fmt          # format Go sources
make vet          # run go vet ./...
make test         # run go test ./... -count=1
make build        # fmt, vet, and build bin/manager
make all          # generate, manifests, and build
```

Run `make generate` and `make manifests` after API or RBAC changes. Review generated diffs with the source change; do not hand-edit generated files. `make build` writes `bin/manager`, which is ignored by Git.

For a focused package test, use the Go tool directly, for example:

```sh
go test ./internal/rotation -count=1
```

The image workflow runs `go build ./...`, `go vet ./...`, and `go test ./... -count=1` before publishing images for `main` and version tags.

## Run locally against Kubernetes

`make deploy` generates manifests and applies CRDs, RBAC, and the manager Deployment in `hive-system`:

```sh
make deploy
kubectl -n hive-system get deployment hive-operator
```

To run the manager from the checkout instead of the Deployment, use a dedicated cluster and do not run both managers against the same resources:

```sh
make run
```

`make run` disables leader election and binds the local dashboard to port `8082`. Stop it with Ctrl+C. Remove the installed resources when finished:

```sh
make undeploy
```

The local process needs the Kubernetes permissions installed by `make deploy` and access to any Hive API endpoints referenced by the resources it reconciles. `make deploy` does not apply sample resources.

## Apply sample resources

Review each manifest and cluster context first. Apply only to an authorized test environment:

```sh
kubectl apply -f config/samples/fleet.yaml
kubectl apply -f config/samples/release.yaml
kubectl apply -f config/samples/housekeeping.yaml
kubectl apply -f config/usage/usagepools.yaml
```

The samples intentionally exercise different controllers:

- `fleet.yaml` creates `SharedAuth`, `HiveSpoke`, and `ModelLadder` resources.
- `release.yaml` creates a `HiveRelease` rollout plan.
- `housekeeping.yaml` creates `HiveHousekeeping` desired state for the remaining hive-ops CronJobs.
- `usagepools.yaml` creates provider-account usage pools; the `hive-usage` sidecar is optional.

Promotion is not a routine development step. Read [docs/rotation-promotion.md](https://github.com/tuna-os/hive-operator/blob/main/docs/rotation-promotion.md), [docs/liveness-promotion.md](https://github.com/tuna-os/hive-operator/blob/main/docs/liveness-promotion.md), [docs/release.md](https://github.com/tuna-os/hive-operator/blob/main/docs/release.md), and [docs/housekeeping.md](https://github.com/tuna-os/hive-operator/blob/main/docs/housekeeping.md) before changing any resource from `Shadow` to `Enforce` or retiring a CronJob.

## Shadow-diff development

Shadow-diff compares controller output with captured or live shell-job output. It is read-only, but live mode still requires authorized cluster access.

Against a live cluster:

```sh
go run ./cmd/hive-shadow-diff --live
```

Against captured inputs:

```sh
go run ./cmd/hive-shadow-diff --bash bash.log --spoke spoke.json
```

For liveness comparisons, use the corresponding flags documented in [docs/liveness-promotion.md](https://github.com/tuna-os/hive-operator/blob/main/docs/liveness-promotion.md). Classify every difference using the categories in [DESIGN.md](https://github.com/tuna-os/hive-operator/blob/main/DESIGN.md) before changing logic: snapshot skew, ladder data, journal state, or an actual parity defect.

## Container images and usage sidecar

The default image names are defined in `Makefile`:

```sh
make docker-build
make docker-build-usage
```

Override tags without editing files:

```sh
make docker-build IMG=ghcr.io/tuna-os/hive-operator:dev
make docker-build-usage USAGE_IMG=ghcr.io/tuna-os/hive-operator/hive-usage:dev
```

The sidecar image pins the Linux x64 `@ccusage/ccusage-linux-x64` package in `Dockerfile.usage`. Keep its version and npm integrity value aligned when updating it. To inspect copied logs without changing a Hive pod, run the sidecar once against a local copy:

```sh
go run ./cmd/hive-usage --once --home /path/to/copy/of/data/home --ccusage "$(which ccusage)" --state ""
```

Replace `/path/to/copy/of/data/home` with a read-only copy and provide a compatible `ccusage` binary. Do not point this command at a live shared store unless the access and impact are explicitly authorized.

## Pull requests

1. Keep changes focused. Update generated CRDs, RBAC, or deepcopy output when their source changes.
2. Add or update tests for controller transitions, policy boundaries, and parity rules. Preserve golden fixtures when they document live shell output.
3. Add a changelog fragment under `changelog.d/` for a user-visible change. [changelog.d/README.md](https://github.com/tuna-os/hive-operator/blob/main/changelog.d/README.md) gives the name and content format.
4. Run the relevant `make` targets locally and inspect `git diff` before committing.
5. Sign commits with the Developer Certificate of Origin:

   ```sh
   git commit -s -m "docs: describe the change"
   ```

6. Open a pull request against `main` with a summary, verification commands, cluster-impact notes, and any required rollout or rollback procedure. Never include credentials, kubeconfigs, API keys, or copied production state.

Changes that alter promotion order, controller authority, image rollout, credentials, or production manifests need explicit maintainer review. Keep operational decisions in the relevant `docs/` runbook and update the README or sample comments when behaviour changes.
