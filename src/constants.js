// Individual font scale keys (must match CSS --fs-* vars)
export const FONT_KEYS = [
  { k:'badge',     nm:'الشارة',            base:40  },
  { k:'tips',      nm:'العنوان الرئيسي',   base:115 },
  { k:'subtitle',  nm:'العنوان الفرعي',    base:27  },
  { k:'intro',     nm:'المقدمة',           base:22  },
  { k:'number',    nm:'رقم البطاقة',       base:42  },
  { k:'cardTitle', nm:'عنوان البطاقة',     base:42  },
  { k:'cardBody',  nm:'النص العربي',       base:20  },
  { k:'code',      nm:'الكود',             base:18  },
  { k:'noteTitle', nm:'عنوان الملاحظة',    base:24  },
  { k:'noteText',  nm:'نص الملاحظة',       base:20  },
  { k:'footer',    nm:'الفوتر',            base:22  },
];
export function defaultFontScales(){ const o={}; FONT_KEYS.forEach(f=>o[f.k]=1); return o; }

// Font-family options for the poster (all loaded from Google Fonts)
export const FONTS = [
  { key: 'Inter',            label: 'Inter — حديث',            family: 'Inter' },
  { key: 'Cairo',            label: 'Cairo — عربي',            family: 'Cairo' },
  { key: 'Oswald',           label: 'Oswald — ضاغط',           family: 'Oswald' },
  { key: 'Bebas Neue',       label: 'Bebas Neue — عرضي',       family: '"Bebas Neue"' },
  { key: 'Playfair Display', label: 'Playfair Display — أنيق', family: '"Playfair Display"' },
  { key: 'Orbitron',         label: 'Orbitron — مستقبلي',      family: 'Orbitron' },
];

export const POSTER_WIDTH = 900;
export const POSTER_MIN_HEIGHT = 1500;
export const EXPORT_SCALES = [
  { v:1, label:'1x — سريع/خفيف' },
  { v:2, label:'2x — متوازن' },
  { v:3, label:'3x — طباعة (افتراضي)' },
  { v:4, label:'4x — أعلى دقة' },
];
export let exportScale = 3;
export function setExportScaleValue(v){ exportScale = +v; }

// Fixed page sizes (width is always POSTER_WIDTH; height varies by aspect ratio)
export const PAGE_SIZES = {
  auto:       { id:'auto',       label:'تلقائي (يتمدد)',                    h:null  },
  sq1:        { id:'sq1',        label:'مربع 1:1 (900×900)',                 h:900   },
  portrait45: { id:'portrait45', label:'بورتريه 4:5 (900×1125)',             h:1125  },
  tall23:     { id:'tall23',     label:'طويل 2:3 (900×1350)',                h:1350  },
  story916:   { id:'story916',   label:'ستوري 9:16 (900×1600)',              h:1600  },
  ig:         { id:'ig',         label:'Instagram feed 4:5 (900×1125)',        h:1125  },
};

// Layout constants for pagination (must match CSS)
export const PAGE_TOP_PAD = 58;
export const PAGE_BOTTOM_PAD = 110;
export const CARD_GAP = 35;           // .card margin-top
export const MIN_CARD_SCALE = 0.45;   // minimum scale for cards on a page (below this → new page)

// Tech logo URLs (devicon CDN)
export const TECH_LOGOS = {
  laravel:  "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/laravel/laravel-original.svg",
  vue:      "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg",
  react:    "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
  js:       "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",
  css:      "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg",
  php:      "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg",
  tailwind: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg",
  bootstrap:"https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bootstrap/bootstrap-original.svg",
  flutter:  "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flutter/flutter-original.svg",
};

// Per-language color presets (--red, --red2) + theme
export const PRESETS = {
  laravel:  { label:"Laravel",  red:"#ff302f", red2:"#b81518", theme:"theme-laravel",  badge:"LARAVEL",  tech:"laravel"  },
  vue:      { label:"Vue",      red:"#42b883", red2:"#2f8f6b", theme:"theme-vue",      badge:"VUE",      tech:"vue"      },
  react:    { label:"React",    red:"#61dafb", red2:"#2a9ec4", theme:"theme-react",    badge:"REACT",    tech:"react"    },
  js:       { label:"JavaScript",red:"#e8c700",red2:"#b89a00", theme:"theme-js",       badge:"JAVASCRIPT",tech:"js"      },
  css:      { label:"CSS",      red:"#38bdf8", red2:"#0ea5e9", theme:"theme-css",      badge:"CSS",      tech:"css"      },
  php:      { label:"PHP",      red:"#8892bf", red2:"#5f6bab", theme:"theme-php",      badge:"PHP",      tech:"php"      },
  tailwind: { label:"Tailwind", red:"#38bdf8", red2:"#0ea5e9", theme:"theme-tailwind", badge:"TAILWIND", tech:"tailwind" },
  bootstrap:{ label:"Bootstrap",red:"#7952b3", red2:"#563d7c", theme:"theme-bootstrap",badge:"BOOTSTRAP",tech:"bootstrap"},
  flutter:  { label:"Flutter",  red:"#54c5f8", red2:"#02569b", theme:"theme-flutter",  badge:"FLUTTER",  tech:"flutter"  },
};

export const THEMES = [
  {id:"theme-laravel",  nm:"Laravel (افتراضي)"},
  {id:"theme-react",    nm:"React — مدارات"},
  {id:"theme-vue",      nm:"Vue — مثلثات"},
  {id:"theme-js",       nm:"JS — مربعات"},
  {id:"theme-css",      nm:"CSS — شبكة"},
  {id:"theme-php",      nm:"PHP — بيضات"},
  {id:"theme-tailwind", nm:"Tailwind — موجات"},
  {id:"theme-bootstrap",nm:"Bootstrap — أعمدة"},
  {id:"theme-flutter",  nm:"Flutter — معينات"},
  {id:"theme-dots",     nm:"نقطي"},
  {id:"theme-curves",   nm:"منحنيات"},
  {id:"theme-gradient", nm:"تدرج"},
  {id:"theme-glow",     nm:"توهج"},
  {id:"theme-particles",nm:"جسيمات"},
  {id:"theme-hexagon",  nm:"سداسي"},
  {id:"theme-mesh",     nm:"شبكي متدرج"},
  {id:"theme-aurora",   nm:"شفق قطبي"},
  {id:"theme-waves",    nm:"موجات متتابعة"},
  {id:"theme-minimal",  nm:"بسيط"},
  {id:"theme-grid",     nm:"شبكة هندسية"},
];

export const COLOR_VARS = [
  {k:"--bg",    nm:"الخلفية"},
  {k:"--red",   nm:"اللون الأساسي"},
  {k:"--red2",  nm:"الأساسي ٢"},
  {k:"--cyan",  nm:"سماوي"},
  {k:"--white", nm:"أبيض"},
  {k:"--muted", nm:"خافت"},
  {k:"--panel", nm:"لوحة"},
  {k:"--panel2",nm:"لوحة ٢"},
];
