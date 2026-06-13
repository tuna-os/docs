---
sidebar_position: 3
title: "ai"
---

*A curated bundle of AI and LLM tools for the terminal — chat clients, coding agents,
local model runners, and speech-to-text.*

Install the whole bundle with:

```bash
bluefin-cli install ai
```

Everything below is installed via Homebrew. Items marked **(cask)** are distributed as
casks rather than formulae.

**Chat & LLM clients**
- [aichat](https://github.com/sigoden/aichat): All-in-one LLM CLI with a shell assistant, chat REPL, and RAG.
- [llm](https://llm.datasette.io/): Datasette's CLI for prompting models, logging responses to SQLite, and running plugins.
- [mods](https://github.com/charmbracelet/mods): AI for the command line — pipe output through an LLM, built by Charm.
- [mistral-vibe](https://mistral.ai/): CLI for interacting with Mistral models.

**Coding agents**
- [crush](https://github.com/charmbracelet/crush): Charm's terminal coding agent with a glamorous TUI.
- [opencode](https://github.com/opencode-ai/opencode): Open-source AI coding agent for the terminal.
- [block-goose-cli](https://github.com/block/goose): Block's extensible open-source AI agent (`goose`).
- [gemini-cli](https://github.com/google-gemini/gemini-cli): Google's Gemini coding agent for the terminal.
- [qwen-code](https://github.com/QwenLM/qwen-code): Alibaba's Qwen-based coding agent.
- [kimi-cli](https://github.com/MoonshotAI): Moonshot AI's Kimi CLI.
- [claude-code](https://github.com/anthropics/claude-code) **(cask)**: Anthropic's agentic coding tool — Claude Code.
- [codex](https://github.com/openai/codex) **(cask)**: OpenAI's Codex coding agent.
- [copilot-cli](https://github.com/github/copilot-cli) **(cask)**: GitHub Copilot in the terminal.

**Local models & runtimes**
- [ramalama](https://github.com/containers/ramalama): Run and serve local LLMs in OCI containers, no GPU plumbing required.
- [lm-studio-linux](https://lmstudio.ai/) **(cask)**: Desktop app for discovering, downloading, and running local LLMs.

**Speech**
- [whisper-cpp](https://github.com/ggerganov/whisper.cpp): High-performance C/C++ port of OpenAI's Whisper for on-device speech-to-text.

:::tip
This bundle moves fast — run `bluefin-cli install list` to see the current set of
bundles, or browse the full catalog in [Available Tools](./tools).
:::
