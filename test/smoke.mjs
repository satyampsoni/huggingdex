import { getModel, searchModels } from '../dist/modules/hf/hf.client.js';
import { readFile } from 'node:fs/promises';

const tests = [
  {
    name: 'get_model — Mistral 7B',
    run: async () => {
      const r = await getModel('mistralai/Mistral-7B-v0.1');
      return {
        id: r.id,
        author: r.author,
        downloads: r.downloads,
        likes: r.likes,
        pipeline_tag: r.pipeline_tag,
        license: r.cardData?.license,
        lastModified: r.lastModified
      };
    }
  },
  {
    name: 'search_models — top 3 text-generation by downloads',
    run: async () => {
      const hits = await searchModels({ task: 'text-generation', sort: 'downloads', limit: 3 });
      return hits.map((h) => ({ id: h.id, downloads: h.downloads, likes: h.likes }));
    }
  },
  {
    name: 'compare_models — Mistral 7B vs Llama 3 8B vs Phi-3 mini',
    run: async () => {
      const ids = [
        'mistralai/Mistral-7B-v0.1',
        'meta-llama/Meta-Llama-3-8B',
        'microsoft/Phi-3-mini-4k-instruct'
      ];
      const cards = await Promise.all(ids.map((id) => getModel(id)));
      return cards
        .map((c) => ({ id: c.id, downloads: c.downloads ?? 0, likes: c.likes ?? 0 }))
        .sort((a, b) => b.downloads - a.downloads);
    }
  },
  {
    name: 'watchlist resource — read tracked-models.json',
    run: async () => {
      const raw = await readFile(new URL('../tracked-models.json', import.meta.url), 'utf-8');
      const models = JSON.parse(raw);
      return { count: models.length, models };
    }
  },
  {
    name: 'get_model — invalid id (expected to throw)',
    run: () => getModel('this-org-does-not-exist/this-model-does-not-exist')
  }
];

let pass = 0;
let fail = 0;

for (const t of tests) {
  console.log(`\n── ${t.name} ──`);
  try {
    const result = await t.run();
    console.log(JSON.stringify(result, null, 2));
    if (t.name.includes('expected to throw')) {
      console.log('!!  expected an error but got a result');
      fail++;
    } else {
      pass++;
    }
  } catch (e) {
    if (t.name.includes('expected to throw')) {
      console.log('✓  threw as expected:', e.message);
      pass++;
    } else {
      console.log('✗  ERROR:', e.message);
      fail++;
    }
  }
}

console.log(`\n=== ${pass} passed, ${fail} failed ===`);
process.exit(fail === 0 ? 0 : 1);
