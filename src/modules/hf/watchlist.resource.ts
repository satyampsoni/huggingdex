import { ResourceDecorator as Resource, ExecutionContext } from '@nitrostack/core';
import { readFile } from 'fs/promises';
import { join } from 'path';

export interface TrackedModel {
  modelId: string;
  lane: string;
}

export class HfWatchlist {
  @Resource({
    uri: 'config://tracked-models',
    name: 'Tracked Models Watchlist',
    description: 'Curated list of Hugging Face models to pay attention to, grouped by lane (open-source-flagship, small-language-model, image-gen).',
    mimeType: 'application/json'
  })
  async getTrackedModels(uri: string, ctx: ExecutionContext) {
    const path = join(process.cwd(), 'tracked-models.json');
    ctx.logger.info('hf.watchlist.read', { path });
    const raw = await readFile(path, 'utf-8');
    const models = JSON.parse(raw) as TrackedModel[];
    return {
      contents: [{
        uri,
        mimeType: 'application/json',
        text: JSON.stringify({ models, count: models.length }, null, 2)
      }]
    };
  }
}
