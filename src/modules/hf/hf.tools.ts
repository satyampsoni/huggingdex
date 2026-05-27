import { ToolDecorator as Tool, Widget, ExecutionContext, z } from '@nitrostack/core';
import { getModel, HfModelCard } from './hf.client.js';

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
}
