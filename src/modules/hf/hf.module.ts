import { Module } from '@nitrostack/core';
import { HfTools } from './hf.tools.js';
import { HfWatchlist } from './watchlist.resource.js';

@Module({
  name: 'hf',
  description: 'Hugging Face Hub integration — models, datasets, spaces',
  controllers: [HfTools, HfWatchlist]
})
export class HfModule {}
