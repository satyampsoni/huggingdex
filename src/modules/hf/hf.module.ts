import { Module } from '@nitrostack/core';
import { HfTools } from './hf.tools.js';

@Module({
  name: 'hf',
  description: 'Hugging Face Hub integration — models, datasets, spaces',
  controllers: [HfTools]
})
export class HfModule {}
