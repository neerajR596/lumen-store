export default function Stars({ value = 0, size = 14 }) {
  return (
    <span className="stars" aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24">
          <defs><linearGradient id={`sg${i}${value}`}><stop offset={`${Math.max(0, Math.min(1, value - i + 1)) * 100}%`} stopColor="currentColor" /><stop offset="0" stopColor="#d2d2d7" /></linearGradient></defs>
          <path fill={`url(#sg${i}${value})`} d="m12 2.8 2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9L12 2.8Z" />
        </svg>
      ))}
    </span>
  );
}
