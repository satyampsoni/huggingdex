'use client';

import { useWidgetSDK } from '@nitrostack/widgets';

const HF_YELLOW = '#FFD21E';

interface ModelCardData {
  id: string;
  author?: string;
  downloads: number;
  likes: number;
  pipelineTag?: string;
  tags: string[];
  license?: string;
  lastModified?: string;
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

function relativeTime(iso?: string): string {
  if (!iso) return '';
  const ms = Date.now() - new Date(iso).getTime();
  const days = Math.floor(ms / 86_400_000);
  if (days < 1) return 'today';
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      fontSize: 11,
      fontWeight: 500,
      padding: '3px 8px',
      borderRadius: 4,
      background: HF_YELLOW,
      color: '#111'
    }}>
      {children}
    </span>
  );
}

export default function ModelCardPage() {
  const sdk = useWidgetSDK();
  const data = sdk.getToolOutput() as ModelCardData | undefined;

  if (!data) {
    return (
      <div style={{ padding: 16, fontFamily: 'system-ui, sans-serif', color: '#666' }}>
        Loading model card…
      </div>
    );
  }

  const hfUrl = `https://huggingface.co/${data.id}`;

  return (
    <div style={{
      padding: 16,
      fontFamily: 'system-ui, sans-serif',
      maxWidth: 560,
      border: `1px solid ${HF_YELLOW}`,
      borderRadius: 8,
      background: '#fff'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <a
          href={hfUrl}
          target="_blank"
          rel="noreferrer"
          style={{ fontSize: 18, fontWeight: 600, color: '#111', textDecoration: 'none' }}
        >
          {data.id}
        </a>
        <span style={{ fontSize: 12, color: '#666' }}>{relativeTime(data.lastModified)}</span>
      </div>

      <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: 13, color: '#444' }}>
        <span>↓ {formatCount(data.downloads)} downloads</span>
        <span>♡ {formatCount(data.likes)} likes</span>
      </div>

      <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
        {data.pipelineTag && <Badge>{data.pipelineTag}</Badge>}
        {data.license && <Badge>{data.license}</Badge>}
      </div>

      {data.tags?.length > 0 && (
        <div style={{ display: 'flex', gap: 4, marginTop: 12, flexWrap: 'wrap' }}>
          {data.tags.slice(0, 8).map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: 11,
                padding: '2px 8px',
                borderRadius: 999,
                background: '#f3f4f6',
                color: '#374151'
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
