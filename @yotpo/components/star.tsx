import { yotpoConfig } from '../config';

export function Star({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 18 18"
      className="h-4 w-4"
      style={{ fill: filled ? yotpoConfig.brand.starsColor : '#E5E5E5' }}
      aria-hidden="true"
    >
      <path d="M9 14.118L14.562 17.475L13.086 11.148L18 6.891L11.529 6.342L9 0.375L6.471 6.342L0 6.891L4.914 11.148L3.438 17.475L9 14.118Z" />
    </svg>
  );
}

export function StarRow({ score }: { score: number }) {
  const rounded = Math.round(score);
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} filled={i < rounded} />
      ))}
    </div>
  );
}
