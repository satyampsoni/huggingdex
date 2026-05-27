# huggingdex

A [NitroStack](https://docs.nitrostack.ai) MCP server that puts the Hugging Face Hub in front of any AI agent — model card lookups, search, side-by-side comparison, and a curated tracked-models watchlist.

Drop it into Claude Desktop, Cursor, Cline, or any MCP-aware client and ask things like *"compare Mistral 7B against Llama 3 8B by license and downloads"* or *"what's the most recently updated image-classification model on the Hub?"*.

## What's inside

### Tools

| Tool | Description |
|------|-------------|
| `get_model({ modelId })` | Fetch a single model card by `owner/repo` id. Renders a `model-card` widget for the human. |
| `search_models({ query?, task?, sort?, limit? })` | Search the Hub by free-text query and/or pipeline tag, sort by downloads / likes / trending / lastModified. |
| `compare_models({ modelIds })` | Fetch 2–10 model cards in parallel, return them sorted by downloads descending. |

### Resource

- `config://tracked-models` — curated watchlist sourced from [`tracked-models.json`](./tracked-models.json) at the project root. Edit the JSON file to change the list without redeploying.

### Prompts

| Prompt | Args | What it does |
|--------|------|--------------|
| `evaluate-model` | `modelId`, `useCase?` | Fetches a model card and asks for a structured evaluation (license, popularity, fit). |
| `compare-for-task` | `task`, `count?` | Searches the Hub for top models on a pipeline task, runs `compare_models`, recommends one. |
| `watchlist-digest` | — | Reads the tracked-models resource and produces a digest grouped by lane. |

Prompts surface in MCP clients as pre-built templates — pick one, fill in the args, and the server returns the prompt messages the agent then runs. In Nitro Studio they appear under the **Prompts** tab.

### Widget

- `model-card` — Next.js-rendered card showing clickable model id, downloads/likes, license + pipeline-tag badges, tags, and last-modified relative time.

## Install

```bash
npm install
npm install --prefix src/widgets   # widgets are a separate Next.js sub-project
```

Copy `.env.example` to `.env` if you want to tune log level or app mode.

## Build

```bash
npm run build
```

Builds both the server (TypeScript → `dist/`) and the widgets (Next.js static export → `src/widgets/out/`). Both are required at runtime.

## Run locally (stdio — Claude Desktop, Cursor, etc.)

Add this entry to your MCP client's config (`~/Library/Application Support/Claude/claude_desktop_config.json` for Claude Desktop on macOS):

```json
{
  "mcpServers": {
    "huggingdex": {
      "command": "sh",
      "args": [
        "-c",
        "cd /absolute/path/to/huggingdex && exec node dist/index.js"
      ]
    }
  }
}
```

The `cd` is required: NitroStack resolves widget HTML relative to `process.cwd()`, and stdio MCP clients don't guarantee any particular working directory for spawned subprocesses.

Restart the MCP client and `huggingdex` should appear in the tools menu with `get_model`, `search_models`, and `compare_models`.

## Run remotely (HTTP / SSE)

```bash
NODE_ENV=production npm run start:prod
```

In production mode NitroStack starts a dual transport — stdio plus an HTTP listener on `http://localhost:3000/mcp` (streamable HTTP) with a legacy SSE endpoint at `GET /sse`. Override host/port with `HOST` / `PORT`, or force a transport explicitly via `MCP_TRANSPORT_TYPE=stdio|http|dual`.

## Dev loop

```bash
npm run dev
```

Boots the server and the widget Next.js dev server with hot reload. Connect [Nitro Studio](https://docs.nitrostack.ai) to inspect tools, resources, and widget renders interactively.

## Smoke test

```bash
npm run build && node test/smoke.mjs
```

Exercises the client against the live Hugging Face API across all three tools, the watchlist, and an expected-failure case (invalid model id).

## Project layout

```
src/
  index.ts                # stdio bootstrap
  app.module.ts           # root NitroStack module
  health/                 # liveness checks
  modules/hf/
    hf.client.ts          # thin fetch wrapper over huggingface.co/api
    hf.tools.ts           # @Tool definitions (get_model, search_models, compare_models)
    hf.prompts.ts         # @Prompt templates (evaluate-model, compare-for-task, watchlist-digest)
    hf.module.ts          # registers tools + watchlist + prompts
    watchlist.resource.ts # @Resource exposing tracked-models.json
  widgets/                # Next.js sub-project — one route per @Widget
tracked-models.json       # curated watchlist data (edit me)
test/smoke.mjs            # live-API smoke checks
```

## Links

- NitroStack docs: <https://docs.nitrostack.ai>
- Hugging Face Hub API: <https://huggingface.co/docs/hub/api>
- Model Context Protocol: <https://modelcontextprotocol.io>

