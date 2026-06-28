---
sidebar_position: 3
title: "AI Bundle"
---

# 🤖 AI Bundle

The **AI bundle** installs a curated set of AI/ML tools for local development:

```bash
bluefin-cli bundle install ai
```

## What's installed

| Tool | Description |
|---|---|
| [`ollama`](https://ollama.ai) | Run large language models locally |
| [`llama.cpp`](https://github.com/ggerganov/llama.cpp) | LLM inference in C/C++ |
| [`whisper`](https://github.com/openai/whisper) | Automatic speech recognition |
| [`tesseract`](https://github.com/tesseract-ocr/tesseract) | OCR engine |
| [`conda`](https://docs.conda.io/) | Package manager for data science |

## Usage

```bash
# Pull and run a model
ollama pull llama3.2
ollama run llama3.2 "What is TunaOS?"

# Transcribe audio with Whisper
whisper recording.mp3 --language en

# OCR an image
tesseract scan.png stdout
```
