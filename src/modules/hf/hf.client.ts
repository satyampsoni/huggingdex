const HF_API = 'https://huggingface.co/api';

export interface HfModelCard {
  id: string;
  author?: string;
  downloads?: number;
  likes?: number;
  pipeline_tag?: string;
  tags?: string[];
  lastModified?: string;
  library_name?: string;
  cardData?: { license?: string; [key: string]: unknown };
}

export interface HfSearchHit {
  id: string;
  author?: string;
  downloads?: number;
  likes?: number;
  pipeline_tag?: string;
  tags?: string[];
  lastModified?: string;
}

async function hfGet<T>(path: string, params?: Record<string, string | number | undefined>): Promise<T> {
  const url = new URL(`${HF_API}${path}`);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined) url.searchParams.set(k, String(v));
    }
  }
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HF API ${res.status} ${res.statusText} — ${url}`);
  }
  return res.json() as Promise<T>;
}

export function getModel(modelId: string): Promise<HfModelCard> {
  const safeId = modelId.split('/').map(encodeURIComponent).join('/');
  return hfGet<HfModelCard>(`/models/${safeId}`);
}

export function searchModels(params: {
  query?: string;
  task?: string;
  sort?: 'downloads' | 'likes' | 'trending' | 'lastModified';
  limit?: number;
}): Promise<HfSearchHit[]> {
  return hfGet<HfSearchHit[]>('/models', {
    search: params.query,
    pipeline_tag: params.task,
    sort: params.sort ?? 'downloads',
    direction: -1,
    limit: params.limit ?? 20
  });
}
