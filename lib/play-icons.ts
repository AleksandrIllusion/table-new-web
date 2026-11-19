// Библиотека векторных иконок для кнопки CTA. Каждая иконка — внутренняя
// разметка SVG (viewBox 0 0 24 24); цвет наследуется от текста кнопки
// (fill="currentColor"), поэтому иконка всегда совпадает с button_fg.
export interface PlayIcon { slug: string; label: string; svg: string }

export const PLAY_ICONS: PlayIcon[] = [
  { slug: "play",        label: "Play",         svg: '<path d="M8 5v14l11-7z"/>' },
  { slug: "play-circle", label: "Play circle",  svg: '<path d="M12 2a10 10 0 100 20 10 10 0 000-20z" opacity=".25"/><path d="M10 8l6 4-6 4z"/>' },
  { slug: "pause",       label: "Pause",        svg: '<path d="M7 5h4v14H7zM13 5h4v14h-4z"/>' },
  { slug: "stop",        label: "Stop",         svg: '<path d="M6 6h12v12H6z"/>' },
  { slug: "forward",     label: "Fast forward", svg: '<path d="M4 6l8 6-8 6zM13 6l8 6-8 6z"/>' },
  { slug: "rewind",      label: "Rewind",       svg: '<path d="M20 6l-8 6 8 6zM11 6l-8 6 8 6z"/>' },
  { slug: "power",       label: "Power",        svg: '<path d="M11 3h2v9h-2z"/><path d="M6.3 6.3a8 8 0 1011.4 0" fill="none" stroke="currentColor" stroke-width="2"/>' },
  { slug: "bolt",        label: "Lightning",    svg: '<path d="M13 2L4 14h6l-1 8 9-12h-6z"/>' },
  { slug: "fire",        label: "Fire",         svg: '<path d="M12 2c1 4-3 5-3 9a3 3 0 006 0c0-1-.5-2-1-2.5.6 3-2 3-2 1 0-3 3-4 0-7.5z"/>' },
  { slug: "rocket",      label: "Rocket",       svg: '<path d="M12 2c3 2 5 6 5 10l-2 3H9l-2-3c0-4 2-8 5-10z"/><path d="M9 17l-2 4 3-1M15 17l2 4-3-1" fill="none" stroke="currentColor" stroke-width="1.6"/>' },
  { slug: "star",        label: "Star",         svg: '<path d="M12 2l2.9 6.3 6.9.6-5.2 4.5 1.6 6.7L12 17l-6.2 3.6 1.6-6.7L2.2 8.9l6.9-.6z"/>' },
  { slug: "sparkle",     label: "Sparkle",      svg: '<path d="M12 2l2 7 7 2-7 2-2 7-2-7-7-2 7-2z"/>' },
  { slug: "crown",       label: "Crown",        svg: '<path d="M3 7l4 4 5-6 5 6 4-4v11H3z"/>' },
  { slug: "trophy",      label: "Trophy",       svg: '<path d="M7 4h10v3a5 5 0 01-10 0zM4 5h3v2a2.5 2.5 0 01-3-2.5zM20 5h-3v2a2.5 2.5 0 003-2.5zM10 13h4v3h-4zM8 19h8v2H8z"/>' },
  { slug: "medal",       label: "Medal",        svg: '<circle cx="12" cy="15" r="5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M9 3l3 6 3-6" fill="none" stroke="currentColor" stroke-width="2"/>' },
  { slug: "gift",        label: "Gift",         svg: '<rect x="3" y="7" width="18" height="4" rx="1"/><rect x="5" y="11" width="14" height="10" rx="1" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 7v14" fill="none" stroke="currentColor" stroke-width="2"/>' },
  { slug: "gem",         label: "Gem",          svg: '<path d="M6 3h12l3 6-9 12L3 9z"/>' },
  { slug: "coin",        label: "Coin",         svg: '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 7v10M9.5 9.5a2.5 2 0 015 0c0 1.5-5 1-5 2.5a2.5 2 0 005 0" fill="none" stroke="currentColor" stroke-width="1.5"/>' },
  { slug: "money-bag",   label: "Money bag",    svg: '<path d="M9 2h6l-2 3h-2zM8 6h8c2 2 4 6 4 9a7 7 0 01-16 0c0-3 2-7 4-9z" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M12 11v5M10.5 12.5a1.8 1.5 0 013 0c0 1-3 .8-3 2a1.8 1.5 0 003 0" fill="none" stroke="currentColor" stroke-width="1.2"/>' },
  { slug: "wallet",      label: "Wallet",       svg: '<rect x="3" y="6" width="18" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="16.5" cy="12" r="1.6"/>' },
  { slug: "dice",        label: "Dice",         svg: '<rect x="3" y="3" width="18" height="18" rx="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="8" cy="8" r="1.6"/><circle cx="16" cy="16" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="16" cy="8" r="1.6"/><circle cx="8" cy="16" r="1.6"/>' },
  { slug: "spade",       label: "Spade",        svg: '<path d="M12 2C9 6 4 9 4 13a4 4 0 007 2.7c-.3 2-1 3-2 4h6c-1-1-1.7-2-2-4A4 4 0 0020 13c0-4-5-7-8-11z"/>' },
  { slug: "club",        label: "Club",         svg: '<circle cx="12" cy="7.5" r="3.2"/><circle cx="7.8" cy="13" r="3.2"/><circle cx="16.2" cy="13" r="3.2"/><path d="M11 13h2l1 7h-4z"/>' },
  { slug: "heart",       label: "Heart",        svg: '<path d="M12 21s-7-4.6-9.2-8.4C1 9.5 2.4 6 5.8 6c2 0 3.3 1.2 4.2 2.4C10.9 7.2 12.2 6 14.2 6c3.4 0 4.8 3.5 3 6.6C19 16.4 12 21 12 21z"/>' },
  { slug: "diamond",     label: "Diamond",      svg: '<path d="M12 2l7 10-7 10-7-10z"/>' },
  { slug: "clover",      label: "Clover",       svg: '<circle cx="9" cy="9" r="3.4"/><circle cx="15" cy="9" r="3.4"/><circle cx="9" cy="15" r="3.4"/><circle cx="15" cy="15" r="3.4"/><path d="M11 12h2v9h-2z"/>' },
  { slug: "cherry",      label: "Cherry",       svg: '<circle cx="8" cy="17" r="3"/><circle cx="16" cy="17" r="3"/><path d="M8 14C8 9 14 9 18 4M16 14C16 10 18 7 18 4" fill="none" stroke="currentColor" stroke-width="1.5"/>' },
  { slug: "horseshoe",   label: "Horseshoe",    svg: '<path d="M6 20V11a6 6 0 1112 0v9" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><circle cx="6" cy="20" r="1.1"/><circle cx="18" cy="20" r="1.1"/>' },
  { slug: "seven",       label: "Lucky 7",      svg: '<path d="M7 5h10l-6 14H8l6-12H7z"/>' },
  { slug: "bar",         label: "BAR",          svg: '<text x="12" y="16" font-size="9" font-weight="700" text-anchor="middle" fill="currentColor" font-family="Arial">BAR</text>' },
  { slug: "bell",        label: "Bell",         svg: '<path d="M12 3a5 5 0 00-5 5c0 6-2 7-2 7h14s-2-1-2-7a5 5 0 00-5-5zM10 20a2 2 0 004 0"/>' },
  { slug: "target",      label: "Target",       svg: '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="1.6"/>' },
  { slug: "ticket",      label: "Ticket",       svg: '<path d="M4 7h16v3a2 2 0 000 4v3H4v-3a2 2 0 000-4z" fill="none" stroke="currentColor" stroke-width="2"/>' },
  { slug: "controller",  label: "Controller",   svg: '<rect x="3" y="9" width="18" height="8" rx="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="8" cy="13" r="1.3"/><circle cx="16" cy="13" r="1.3"/>' },
  { slug: "clock",       label: "Clock",        svg: '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 7v5l3 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' },
  { slug: "arrow-right", label: "Arrow",        svg: '<path d="M4 11h11l-4-4 1.4-1.4L20 12l-7.6 6.4L11 17l4-4H4z"/>' },
  { slug: "double-arrow",label: "Double arrow", svg: '<path d="M4 6l6 6-6 6zM12 6l6 6-6 6z"/>' },
  { slug: "flag",        label: "Checkered",    svg: '<path d="M5 3v18M5 4h14l-3 4 3 4H5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' },
  { slug: "tap",         label: "Tap",          svg: '<path d="M9 11V5a2 2 0 014 0v6l3 1c2 .5 3 2 3 4v4H9l-4-5 2-2z" fill="none" stroke="currentColor" stroke-width="1.6"/>' },
  { slug: "thumbsup",    label: "Thumbs up",    svg: '<path d="M7 10v10H4V10zM9 10l3-7c1.6 0 2.5 1 2 3l-.7 2H18a2 2 0 012 2.4l-1.2 6A2 2 0 0117 20H9z" fill="none" stroke="currentColor" stroke-width="1.4"/>' },
];

export const PLAY_ICON_MAP: Record<string, string> =
  Object.fromEntries(PLAY_ICONS.map((i) => [i.slug, i.svg]));
