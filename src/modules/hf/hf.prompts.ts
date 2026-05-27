import { PromptDecorator as Prompt, ExecutionContext } from '@nitrostack/core';

type Args = Record<string, string | number | boolean | null>;

export class HfPrompts {
  @Prompt({
    name: 'evaluate-model',
    title: 'Evaluate a Hugging Face model',
    description: 'Fetch a model card via get_model and produce a structured evaluation — license, popularity, recency, and fit for the given use case.',
    arguments: [
      { name: 'modelId', description: 'Full HF model id in "owner/repo" form, e.g. mistralai/Mistral-7B-v0.1.', required: true },
      { name: 'useCase', description: 'Optional intended use case to evaluate against (e.g. "on-device chat", "RAG over legal docs").', required: false }
    ]
  })
  async evaluateModel(args: Args, ctx: ExecutionContext) {
    ctx.logger.info('hf.prompt.evaluate-model', args);
    const modelId = String(args.modelId);
    const useCase = args.useCase ? String(args.useCase) : null;

    const useCaseLine = useCase
      ? `Evaluate it specifically for the following use case: "${useCase}".`
      : 'Evaluate it for general production use.';

    return [
      {
        role: 'user' as const,
        content:
`Use the huggingdex MCP server to fetch the model card for ${modelId} (call get_model). Then produce a short evaluation covering:

1. **License** — what does it allow, and any commercial-use caveats?
2. **Popularity & momentum** — downloads, likes, and how recently it was updated.
3. **Pipeline / task fit** — the declared pipeline_tag and what that implies.
4. **Verdict** — one line, would you ship with this?

${useCaseLine}`
      }
    ];
  }

  @Prompt({
    name: 'compare-for-task',
    title: 'Compare top models for a task',
    description: 'Search the Hub for the top models on a given pipeline task, then run compare_models on them and recommend one.',
    arguments: [
      { name: 'task', description: 'Pipeline tag, e.g. "text-generation", "image-classification", "automatic-speech-recognition".', required: true },
      { name: 'count', description: 'How many models to compare (2–10). Defaults to 3.', required: false }
    ]
  })
  async compareForTask(args: Args, ctx: ExecutionContext) {
    ctx.logger.info('hf.prompt.compare-for-task', args);
    const task = String(args.task);
    const rawCount = args.count !== undefined && args.count !== null ? Number(args.count) : 3;
    const count = Math.min(10, Math.max(2, Number.isFinite(rawCount) ? rawCount : 3));

    return [
      {
        role: 'user' as const,
        content:
`Use the huggingdex MCP server to find the best ${count} open-source models for the task "${task}":

1. Call search_models with task="${task}", sort="downloads", limit=${count}.
2. Take the ids you got back and call compare_models on them.
3. Present the comparison as a table (id, downloads, likes, license, lastModified).
4. Recommend one to ship with, and say why in one sentence. Call out any restrictive licenses.`
      }
    ];
  }

  @Prompt({
    name: 'watchlist-digest',
    title: 'Digest the tracked-models watchlist',
    description: 'Read the config://tracked-models resource and produce a current-state digest of every model on the watchlist, grouped by lane.',
  })
  async watchlistDigest(_args: Args, ctx: ExecutionContext) {
    ctx.logger.info('hf.prompt.watchlist-digest', {});
    return [
      {
        role: 'user' as const,
        content:
`Use the huggingdex MCP server to produce a digest of our tracked-models watchlist:

1. Read the resource config://tracked-models to get the current list.
2. For every model on the watchlist, call get_model to get fresh stats.
3. Group the results by lane (open-source-flagship, small-language-model, image-gen, …).
4. For each lane, list each model with: downloads, likes, license, and lastModified (relative).
5. End with a one-line "what changed" — which model is now the leader by downloads in each lane?`
      }
    ];
  }
}
