/* Shared app-icon artwork for the PWA (favicon, apple-touch-icon, manifest
   icons). Rendered with next/og's Satori, so it uses plain flex divs (no SVG
   paths) — three ascending bars on the dark brand background. The background is
   full-bleed so the icon is safe to use as a maskable icon. */
import { ImageResponse } from 'next/og';

const BG = '#101010';
const ACCENT = '#1f9d57';
const LIGHT = '#4fd089';

/** A square finance icon at the given pixel size. `pad` is the fraction of the
    canvas kept clear around the bars (use ~0.18 for maskable safe-zone). */
export function iconResponse(size: number, pad = 0.16): ImageResponse {
  const inset = Math.round(size * pad);
  const gap = Math.round(size * 0.06);
  const barW = Math.round(size * 0.16);
  const heights = [0.34, 0.56, 0.82]; // ascending bars, fraction of canvas

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: BG,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          gap,
          paddingBottom: inset,
        }}
      >
        {heights.map((h, i) => (
          <div
            key={i}
            style={{
              width: barW,
              height: Math.round((size - inset * 2) * h),
              borderRadius: Math.round(barW * 0.28),
              background: i === heights.length - 1 ? LIGHT : ACCENT,
            }}
          />
        ))}
      </div>
    ),
    { width: size, height: size },
  );
}
