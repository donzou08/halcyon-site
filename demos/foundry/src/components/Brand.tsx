/**
 * Kestrel Castings identity.
 *
 * The mark here is a monogram drawn from the company's blue and its droplet
 * silhouette. Drop the real logo in as an SVG and swap the body of `FoundryMark`
 * when the artwork is to hand; nothing else needs to change.
 */

export function FoundryMark({ size = 28 }: { size?: number }) {
  return (
    <span
      aria-hidden
      className="inline-flex shrink-0 items-center justify-center bg-brand font-bold text-white select-none"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        letterSpacing: '0.01em',
        borderRadius: `${size * 0.5}px ${size * 0.5}px ${size * 0.5}px ${size * 0.16}px`,
      }}
    >
      KC
    </span>
  );
}

export function FoundryLockup({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <FoundryMark size={compact ? 24 : 30} />
      <span className="leading-tight">
        <span className={`block font-semibold ${compact ? 'text-[14px]' : 'text-[16px]'}`}>
          Kestrel Castings
        </span>
        {!compact && (
          <span className="block text-[12px] text-muted">
            Pvt. Ltd. · Hosur, Tamil Nadu
          </span>
        )}
      </span>
    </span>
  );
}
