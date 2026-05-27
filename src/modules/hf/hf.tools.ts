import { ToolDecorator as Tool, Widget, ExecutionContext, z } from '@nitrostack/core';
import { getModel, searchModels, HfModelCard } from './hf.client.js';

function trim(card: HfModelCard) {
  return {
    id: card.id,
    author: card.author,
    downloads: card.downloads ?? 0,
    likes: card.likes ?? 0,
    pipelineTag: card.pipeline_tag,
    tags: card.tags ?? [],
    license: card.cardData?.license,
    lastModified: card.lastModified
  };
}

export class HfTools {
  @Tool({
    name: 'get_model',
    description: 'Fetch the model card for a Hugging Face model by its repo id (e.g. "mistralai/Mistral-7B-v0.1").',
    inputSchema: z.object({
      modelId: z.string().describe('Full HF model id in "owner/repo" form.')
    })
  })
  @Widget('model-card')
  async getModel(input: any, ctx: ExecutionContext) {
    ctx.logger.info('hf.get_model', { modelId: input.modelId });
    const card = await getModel(input.modelId);
    return trim(card);
  }

  @Tool({
    name: 'search_models',
    description: 'Search the Hugging Face Hub for models. Filter by task (pipeline_tag) and sort by downloads, likes, trending, or lastModified.',
    inputSchema: z.object({
      query: z.string().optional().describe('Free-text search across model ids and descriptions.'),
      task: z.string().optional().describe('Pipeline tag, e.g. "text-generation", "image-classification".'),
      sort: z.enum(['downloads', 'likes', 'trending', 'lastModified']).optional().describe('How to rank results. Defaults to downloads.'),
      limit: z.number().int().min(1).max(50).optional().describe('Max results, 1–50. Defaults to 20.')
    })
  })
  async searchModels(input: any, ctx: ExecutionContext) {
    ctx.logger.info('hf.search_models', input);
    const hits = await searchModels(input);
    return hits.map((h) => ({
      id: h.id,
      author: h.author,
      downloads: h.downloads ?? 0,
      likes: h.likes ?? 0,
      pipelineTag: h.pipeline_tag,
      lastModified: h.lastModified
    }));
  }
}
