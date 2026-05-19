'use client';
import { TouchEvent, useMemo, useState } from 'react';

type Photo = { id: string; imageUrl: string; altText?: string | null };

export default function GalleryViewer({ photos }: { photos: Photo[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const [scale, setScale] = useState(1);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const current = useMemo(() => (index === null ? null : photos[index]), [index, photos]);

  const close = () => { setIndex(null); setScale(1); };
  const prev = () => setIndex((v) => (v && v > 0 ? v - 1 : v));
  const next = () => setIndex((v) => (v !== null && v < photos.length - 1 ? v + 1 : v));

  const onTouchStart = (e: TouchEvent<HTMLDivElement>) => setTouchStartX(e.changedTouches[0].clientX);
  const onTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    if (touchStartX === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (dx > 40) prev();
    if (dx < -40) next();
    setTouchStartX(null);
  };

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
          <div onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '90vw', maxHeight: '85vh' }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
              <button onClick={() => setScale((s) => Math.max(1, s - 0.25))}>-</button>
              <button onClick={() => setScale((s) => Math.min(4, s + 0.25))}>+</button>
              <button onClick={prev}>←</button>
              <button onClick={next}>→</button>
              <span>{(index ?? 0) + 1} / {photos.length}</span>
              <button onClick={close}>Закрыть</button>
            </div>
            <div style={{ overflow: 'auto', maxHeight: '70vh', touchAction: 'pan-y pinch-zoom' }}>
              <img src={current.imageUrl} alt={current.altText ?? ''} style={{ transform: `scale(${scale})`, transformOrigin: 'center center', maxWidth: '100%', display: 'block', margin: '0 auto' }} />
            </div>
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginTop: 8 }}>
              {photos.map((p, i) => (
                <button key={p.id} onClick={() => setIndex(i)} style={{ border: i === index ? '2px solid #ef8f00' : '1px solid #ccc', padding: 0 }}>
                  <img src={p.imageUrl} alt="thumb" style={{ width: 56, height: 56, objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
