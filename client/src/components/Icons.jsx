const s = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' };
export const Logo = (p) => (
  <svg viewBox="0 0 24 24" width="20" height="20" {...p}><circle cx="12" cy="12" r="10" fill="currentColor" opacity=".12" /><circle cx="12" cy="12" r="6.5" fill="currentColor" /><circle cx="12" cy="12" r="2.6" fill="var(--bg, #fff)" /></svg>
);
export const SearchIcon = (p) => <svg viewBox="0 0 24 24" width="18" height="18" {...s} {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>;
export const BagIcon = (p) => <svg viewBox="0 0 24 24" width="18" height="18" {...s} {...p}><path d="M5 8h14l-1 12H6L5 8Z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></svg>;
export const UserIcon = (p) => <svg viewBox="0 0 24 24" width="18" height="18" {...s} {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></svg>;
export const CloseIcon = (p) => <svg viewBox="0 0 24 24" width="18" height="18" {...s} {...p}><path d="M6 6l12 12M18 6 6 18" /></svg>;
export const Chevron = (p) => <svg viewBox="0 0 24 24" width="14" height="14" {...s} strokeWidth="2" {...p}><path d="m9 6 6 6-6 6" /></svg>;
export const Truck = (p) => <svg viewBox="0 0 24 24" width="22" height="22" {...s} {...p}><path d="M3 6h11v10H3zM14 10h4l3 3v3h-7" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" /></svg>;
export const Shield = (p) => <svg viewBox="0 0 24 24" width="22" height="22" {...s} {...p}><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z" /><path d="m9 12 2 2 4-4" /></svg>;
export const Return = (p) => <svg viewBox="0 0 24 24" width="22" height="22" {...s} {...p}><path d="M4 9h11a5 5 0 0 1 0 10H8" /><path d="m8 5-4 4 4 4" /></svg>;
export const Spark = (p) => <svg viewBox="0 0 24 24" width="22" height="22" {...s} {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" /></svg>;
export const MenuIcon = (p) => <svg viewBox="0 0 24 24" width="20" height="20" {...s} {...p}><path d="M4 8h16M4 16h16" /></svg>;
