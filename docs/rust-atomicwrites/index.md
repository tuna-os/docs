---
sidebar_position: 1
sidebar_label: "rust-atomicwrites"

status: unknown
---

[![Build Status](https://github.com/tuna-os/rust-atomicwrites/actions/workflows/msrv.yml/badge.svg)](https://github.com/tuna-os/rust-atomicwrites/actions)

- [Documentation](https://docs.rs/crate/atomicwrites)
- [Repository](https://github.com/tuna-os/rust-atomicwrites)
- [crates.io](https://crates.io/crates/atomicwrites)
- [Upstream](https://github.com/untitaker/rust-atomicwrites) (original project by Markus Unterwaditzer)

Atomic file-writes. Works on both POSIX and Windows.

The basic idea is to write to temporary files (in the same file system), and
move them when done writing. This avoids the problem of two programs writing to
the same file. For `AllowOverwrite`, `rename` is used. For `DisallowOverwrite`,
`link + unlink` is used instead to raise errors when the target path already
exists.

This is mostly a port of the same-named
[Python package](https://github.com/untitaker/python-atomicwrites).


## Contribute compute — no code needed

**[Donate time with your AI CLI](https://hub.tunaos.org/#contribute).**

Your machine runs one task at a time using your signed-in AI coding CLI.
The relay alternates between eligible **School** (OS) and **Reef** (apps)
hives after each task. If one hive has no work, the other can continue.

The guide covers prerequisites, verified `just` setup, credentials, provider
costs, and how to stop with Ctrl+C. Your subscription quota or API charges apply.
Never post account credentials or API keys in issues or pull requests.

## Example

```rust
use atomicwrites::{AtomicFile,DisallowOverwrite};

let af = AtomicFile::new("foo", DisallowOverwrite);
af.write(|f| {
    f.write_all(b"HELLO")
})?;
```

## Alternatives

- [tempfile](https://github.com/Stebalien/tempfile) has a `persist` method doing
  the same thing.

## License

Licensed under MIT, see ``LICENSE``.
