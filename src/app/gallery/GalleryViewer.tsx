'use client';
import { useMemo, useState } from 'react';

type Photo = { id: string; imageUrl: string; altText?: string | null };

export default function GalleryViewer({ photos }: { photos: Photo[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const [scale, setScale] = useState(1);
  const current = useMemo(() => (index === null ? null : photos[index]), [index, photos]);

  const close = () => { setIndex(null); setScale(1); };
  const zoomIn = () => setScale((s) => Math.min(4, s + 0.25));
  const zoomOut = () => setScale((s) => Math.max(1, s - 0.25));

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(120px,1fr))', gap: 8 }}>
        {photos.map((p, i) => (
          <button key={p.id} onClick={() => setIndex(i)} style={{ padding: 0, border: 'none', background: 'transparent' }}>
            <img src={p.imageUrl} alt={p.altText ?? ''} style={{ width: '100%', borderRadius: 8 }} />
          </button>
        ))}
      </div>

      {current && (
        <div onClick={close} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 50, display: 'grid', placeItems: 'center', padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: '90vw', maxHeight: '85vh' }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <button onClick={zoomOut}>-</button>
              <button onClick={zoomIn}>+</button>
              <button onClick={() => setIndex((v) => (v && v > 0 ? v - 1 : v))}>←</button>
              <button onClick={() => setIndex((v) => (v !== null && v < photos.length - 1 ? v + 1 : v))}>→</button>
              <button onClick={close}>Закрыть</button>
            </div>
            <div style={{ overflow: 'auto', maxHeight: '75vh', touchAction: 'pinch-zoom' }}>
              <img src={current.imageUrl} alt={current.altText ?? ''} style={{ transform: `scale(${scale})`, transformOrigin: 'center center', maxWidth: '100%', display: 'block', margin: '0 auto' }} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
