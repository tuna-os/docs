---
sidebar_position: 5
title: "TROUBLESHOOTING"
---

Common problems, with the commands to diagnose them. For build and install
errors, see the Troubleshooting section in
[CONTRIBUTING.md](https://github.com/tuna-os/dualcut/blob/main/CONTRIBUTING.md#troubleshooting).

## Export and GStreamer

**Export fails with "Couldn't create encoder for format audio/mpeg".**
The AAC encoder is missing. MP4 and M4A export need `avenc_aac`.

```sh
gst-inspect-1.0 avenc_aac
gst-inspect-1.0 x264enc
```

If either is missing, install the GStreamer libav and ugly plugin sets for
your distribution. Then run `gst-inspect-1.0` again.

**Export or preview fails on a codec or discovery error.** Raise the
GStreamer log level for that one command:

```sh
GST_DEBUG=2 cargo run --bin render -- project.json out.mp4
```

Check for stale `GST_PLUGIN_PATH` or `GST_PLUGIN_SYSTEM_PATH` values that
point at another installation. `pkg-config` success does not prove that the
runtime plugins are present.

**Preview shows black video, no position, or a play button that does
nothing.** Look for `Failed to link sink element` in the terminal output.
That message comes from a sink-setup problem in the app, not from your
project. Report it with your GStreamer version. Include the output of
`gst-inspect-1.0 --version`.

**Export rejects the output name.** The profile comes from the file extension
or the profile name. Supported names include `mp4` (or `h264`), `webm` (or
`vp8`), `vp9`, `av1`, `h265`, `prores` (or `mov`), `ffv1` (or `mkv`), `m4a`,
`ogg`, `flac`, `mp3`, and `wav`. Any other name is an error.

**Captions fail with "No whisper model found".** Set `DUALCUT_WHISPER_MODEL`
to the path of a ggml Whisper model file, then start the app again.

## HTTP API

The API listens on `127.0.0.1:7357` by default. Check that it responds:

```sh
curl -s http://127.0.0.1:7357/status
```

**"agent API not available: binding 127.0.0.1:7357" in the terminal.** Another
process uses the port. Choose a different port with `DUALCUT_API_PORT`, or set
it to `0` to turn the API off:

```sh
DUALCUT_API_PORT=7358 preview project.json
```

For `serve`, pass the port as the second argument:
`cargo run --bin serve -- project.json 7358`.

**Connection refused.** The app or `serve` is not running, or it uses another
port. Check the port you set, then run the `curl` command above again.

**403 Forbidden.** The request has an `Origin` header, or its `Host` is not
`localhost` or an IP address. Browser pages cannot use the API. Use `curl` or
a script instead.

**400 with an error message.** The server rejected the body and did not change
the project file. Read the `error` field. For `/op`, check the op name and its
required fields. For `/project`, check the document against
[`engine/schema/dualcut.schema.json`](https://github.com/tuna-os/dualcut/blob/main/engine/schema/dualcut.schema.json).

**501 on `/script`.** The `serve` binary was built without the `scripting`
feature. Rebuild it with `--features scripting`.

## Project files

**The project does not open, or the app reports validation errors.** Check the
JSON syntax first, then the fields listed in the schema. Ids must be unique,
and scenes must have `duration > 0`.

```sh
curl -s http://127.0.0.1:7357/project
```

A `500` from `GET /project` means the file cannot be read or parsed.

## Performance and display

**`preview` will not start.** It needs a graphical session and libadwaita 1.8
or newer. Check the version:

```sh
pkg-config --atleast-version=1.8 libadwaita-1 && echo ok
```

`render` and `serve` run without a desktop session. Use them to check
whether a problem is in the UI or in the engine.

**Preview is slow with a large project.** No tuning guide exists for this in
the repository yet. Test with a smaller project to narrow the cause, and
include the project size and GPU details in a bug report.

## When to file a bug

Check this page and the setup steps in CONTRIBUTING first. File a bug if the
problem reproduces with a fresh checkout and a supported toolchain. Include:

- the command you ran and its full output;
- `gst-inspect-1.0 --version` and `rustc -vV`;
- the project file, or a minimal project that shows the problem.

A missing package or a wrong path is a configuration issue. Fix it locally
and do not file a bug.
